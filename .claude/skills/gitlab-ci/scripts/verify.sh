#!/usr/bin/env bash
# Verify a .gitlab-ci.yml file across glci's verification ladder.
# Usage: ./verify.sh [-f FILE] [--project G/P] <tier> [tier-args...]
#
# Tiers (auto combines lint and show before optional simulation):
#   auto                          - lint + show, plus simulate when Docker is
#                                   reachable. The recommended default.
#   lint                          - glci lint (offline). Falls back to
#                                   glab ci lint when glci is absent.
#   show [--json] [--context X]   - glci show. Renders the pipeline graph.
#                                   Requires glci (no glab fallback).
#   simulate                      - glci run --simulate. Plans execution with
#                                   echoed scripts and dummy artifacts.
#                                   Requires glci and a reachable Docker daemon.
#   run [job...] --confirm-docker - glci run [job...]. Real execution.
#                                   Requires glci, Docker, and explicit opt-in.
#
# Common flags:
#   -f FILE         CI config path (default: .gitlab-ci.yml)
#   --project G/P   Force project context for glab fallback (lint tier only)
#   --help, -h      Show this help
#
# Environment:
#   VALIDATE_BACKEND=auto|glci|glab   Forces lint backend (default: auto)
#   VALIDATE_PROJECT=group/project    Project context for glab fallback
#
# Exit codes:
#   0   Verification passed
#   Nonzero child statuses are preserved; read stderr for the cause.
#   2   Also used for wrapper setup errors (missing tool, Docker, or opt-in)

set -uo pipefail

usage() { sed -n '2,30p' "$0" | sed 's/^# \{0,1\}//'; }

FILE=".gitlab-ci.yml"
PROJECT_FLAG=""
while [ $# -gt 0 ]; do
  case "$1" in
    -f|--file) shift; FILE="${1:-}"; shift ;;
    -f=*|--file=*) FILE="${1#*=}"; shift ;;
    --project) shift; PROJECT_FLAG="${1:-}"; shift ;;
    --project=*) PROJECT_FLAG="${1#*=}"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) break ;;
  esac
done

if [ $# -lt 1 ]; then
  echo "ERROR: missing tier (auto, lint, show, simulate, or run)" >&2
  echo "" >&2
  usage >&2
  exit 2
fi

TIER="$1"; shift

if [ ! -f "$FILE" ]; then
  echo "ERROR: $FILE not found" >&2
  exit 2
fi

# Tool detection.
have_glci=0
have_glab=0
command -v glci >/dev/null 2>&1 && have_glci=1
command -v glab >/dev/null 2>&1 && have_glab=1

# Manual installs via `sudo mv` can preserve a non-executable mode silently.
broken_glci_path=""
if [ "$have_glci" = 0 ]; then
  for c in /usr/local/bin/glci /opt/homebrew/bin/glci "$HOME/bin/glci" "$HOME/.local/bin/glci"; do
    if [ -f "$c" ] && [ ! -x "$c" ]; then
      broken_glci_path="$c"
      break
    fi
  done
fi

print_glci_install() {
  echo "Install glci (runs offline, no GitLab account required):" >&2
  echo "  curl -fsSL https://gitlab.com/gitlab-org/ci-cd/runner-tools/glci/-/raw/main/install.sh | bash" >&2
  echo "  (browse releases: https://gitlab.com/gitlab-org/ci-cd/runner-tools/glci/-/releases)" >&2
}

print_glab_install() {
  echo "Install glab (lint fallback, requires authenticated GitLab account):" >&2
  echo "  https://gitlab.com/gitlab-org/cli#installation" >&2
}

print_docker_install_offer() {
  local os
  os="$(uname -s 2>/dev/null || echo unknown)"
  echo "" >&2
  echo "To unlock the simulate and run tiers, install Docker:" >&2
  case "$os" in
    Darwin)
      echo "  macOS (lightweight):  brew install colima docker && colima start" >&2
      echo "  macOS (GUI):          https://www.docker.com/products/docker-desktop" >&2
      ;;
    Linux)
      echo "  Linux:                curl -fsSL https://get.docker.com | sh" >&2
      ;;
    *)
      echo "  Install Docker for your platform: https://docs.docker.com/get-docker/" >&2
      ;;
  esac
  echo "" >&2
  echo "glci needs Docker to spin up the gitlab-runner image and run jobs locally" >&2
  echo "with the same fidelity as a real GitLab pipeline." >&2
}

require_glci() {
  if [ "$have_glci" = 1 ]; then return 0; fi
  if [ -n "$broken_glci_path" ]; then
    echo "ERROR: found glci at $broken_glci_path but it is not executable." >&2
    echo "  Fix it: chmod +x $broken_glci_path" >&2
  else
    echo "ERROR: '$TIER' tier requires glci, but glci is not installed." >&2
    echo "  (Only the 'lint' tier can fall back to glab; higher tiers cannot.)" >&2
    echo "" >&2
    print_glci_install
  fi
  exit 2
}

# Returns 0 if Docker is reachable, 1 otherwise. Does not exit.
docker_reachable() {
  command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
}

# Returns 0 if the working tree has at least one commit, OR if we are not
# inside a git work tree at all (glci uses synthetic vars in that case).
# Returns 1 only for the panic-triggering case: git repo with zero commits.
has_commits() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    return 0
  fi
  git rev-parse HEAD >/dev/null 2>&1
}

# Hard-fail with the no-commits diagnosis. Used by simulate and run tiers.
require_commits() {
  if has_commits; then return 0; fi
  echo "ERROR: '$TIER' tier needs at least one git commit in this repo." >&2
  echo "  glci's embedded gitlab-runner panics on commit-less repos:" >&2
  echo "    panic: runtime error: slice bounds out of range [:8] with length 4" >&2
  echo "  (lint and show still work in commit-less repos.)" >&2
  echo "" >&2
  echo "  Fix: create an initial commit and re-run." >&2
  echo "    git add -A && git commit -m \"Initial commit\"" >&2
  exit 2
}

require_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "ERROR: '$TIER' tier needs Docker, but the docker CLI is not on PATH." >&2
    print_docker_install_offer
    exit 2
  fi
  if ! docker info >/dev/null 2>&1; then
    echo "ERROR: '$TIER' tier needs a reachable Docker daemon, but 'docker info' failed." >&2
    echo "  Start Docker (or your Docker daemon), then re-run." >&2
    echo "  For a detailed environment report: glci doctor" >&2
    exit 2
  fi
}

# glab project resolution: explicit flag, then env var, then git remote.
# Returns empty if none resolve.
resolve_glab_project() {
  if [ -n "$PROJECT_FLAG" ]; then echo "$PROJECT_FLAG"; return 0; fi
  if [ -n "${VALIDATE_PROJECT:-}" ]; then echo "$VALIDATE_PROJECT"; return 0; fi
  local remote_url stripped
  remote_url="$(git config --get remote.origin.url 2>/dev/null || true)"
  if [ -n "$remote_url" ]; then
    # Match git@gitlab.com:g/p[.git] and https://gitlab.com/g/p[.git]. Non-GitLab
    # hosts (github.com, etc.) leave the URL unchanged and are rejected below.
    stripped="$(echo "$remote_url" | sed -E 's#^(https?://|git@)[^/:]*gitlab[^/:]*[:/]##')"
    if [ -n "$stripped" ] && [ "$stripped" != "$remote_url" ]; then
      echo "${stripped%.git}"
      return 0
    fi
  fi
  echo ""
}

print_no_project_error() {
  echo "ERROR: glab backend requires a GitLab project context." >&2
  echo "  No project found via --project, VALIDATE_PROJECT env var, or git remote." >&2
  echo "" >&2
  echo "Options:" >&2
  echo "  1. Install glci (recommended, validates offline, no project required):" >&2
  print_glci_install
  echo "  2. Set VALIDATE_PROJECT=your-group/your-project and re-run." >&2
  echo "  3. Pass --project your-group/your-project to verify.sh." >&2
}

# Lint backend selection.
do_lint() {
  local backend="${VALIDATE_BACKEND:-auto}"
  case "$backend" in
    auto)
      if [ "$have_glci" = 1 ]; then
        backend=glci
      elif [ -n "$broken_glci_path" ]; then
        echo "ERROR: found glci at $broken_glci_path but it is not executable." >&2
        echo "  Fix it: chmod +x $broken_glci_path" >&2
        exit 2
      elif [ "$have_glab" = 1 ]; then
        backend=glab
        echo "Note: glci not detected on PATH; falling back to glab ci lint." >&2
      else
        echo "ERROR: neither glci nor glab is installed." >&2
        print_glci_install
        print_glab_install
        exit 2
      fi
      ;;
    glci)
      if [ "$have_glci" != 1 ]; then
        echo "ERROR: VALIDATE_BACKEND=glci but glci is not installed." >&2
        print_glci_install
        exit 2
      fi
      ;;
    glab)
      if [ "$have_glab" != 1 ]; then
        echo "ERROR: VALIDATE_BACKEND=glab but glab is not installed." >&2
        print_glab_install
        exit 2
      fi
      ;;
    *)
      echo "ERROR: unknown VALIDATE_BACKEND: $backend (expected auto, glci, or glab)" >&2
      exit 2
      ;;
  esac
  case "$backend" in
    glci)
      echo "Validating $FILE via glci lint..."
      exec glci lint --quiet -f "$FILE"
      ;;
    glab)
      local project
      project="$(resolve_glab_project)"
      if [ -z "$project" ]; then
        print_no_project_error
        exit 2
      fi
      echo "Validating $FILE via glab ci lint (project: $project)..."
      exec glab ci lint --repo "$project" "$FILE"
      ;;
  esac
}

case "$TIER" in
  auto)
    # Lint + show always; simulate when Docker is reachable AND the repo has
    # at least one commit. The recommended default for Workflows 1 and 4.
    # Workflows 2 and 3 should call run directly against a specific job with
    # --reuse-artifacts.
    require_glci
    # show can render a config that lint rejects, so run both checks.
    glci lint --quiet -f "$FILE" || exit $?
    glci show -f "$FILE" || exit $?
    if ! docker_reachable; then
      echo "" >&2
      echo "Docker not reachable; stopped after show. Lint and show passed." >&2
      print_docker_install_offer
      exit 0
    fi
    if ! has_commits; then
      echo "" >&2
      echo "Stopped after show: this repo has no commits yet, and glci run" >&2
      echo "(including --simulate) needs at least one commit to start gitlab-runner." >&2
      echo "  Fix: git add -A && git commit -m \"Initial commit\"" >&2
      echo "  Then: bash scripts/verify.sh simulate" >&2
      exit 0
    fi
    echo ""
    echo "Docker reachable; running glci run --simulate for deeper verification..."
    exec glci run --simulate -f "$FILE"
    ;;
  lint)
    do_lint
    ;;
  show)
    require_glci
    exec glci show -f "$FILE" "$@"
    ;;
  simulate)
    require_glci
    require_docker
    require_commits
    exec glci run --simulate -f "$FILE" "$@"
    ;;
  run)
    require_glci
    require_docker
    require_commits
    # The --confirm-docker flag is verify.sh's opt-in gate. Strip it before
    # passing remaining args to glci. If the user did not pass it, refuse.
    confirmed=0
    filtered=()
    for arg in "$@"; do
      if [ "$arg" = "--confirm-docker" ]; then
        confirmed=1
      else
        filtered+=("$arg")
      fi
    done
    if [ "$confirmed" != 1 ]; then
      echo "ERROR: 'run' tier requires --confirm-docker to opt in to real Docker execution." >&2
      echo "  glci run will pull images, start containers, execute scripts, and write artifacts." >&2
      echo "  Re-run with: bash scripts/verify.sh run [job...] --confirm-docker" >&2
      exit 2
    fi
    exec glci run -f "$FILE" "${filtered[@]}"
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    echo "ERROR: unknown tier '$TIER' (expected: auto, lint, show, simulate, run)" >&2
    echo "" >&2
    usage >&2
    exit 2
    ;;
esac
