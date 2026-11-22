#!/usr/bin/env bash
# Exercise the wrapper's decisions without running a pipeline or contacting Docker.
set -euo pipefail

repo_dir="$(cd "$(dirname "$0")/.." && pwd)"
verify_script="${1:-$repo_dir/scripts/verify.sh}"
test_dir="$(mktemp -d)"
trap 'rm -rf "$test_dir"' EXIT
mkdir "$test_dir/bin"
printf 'check:\n  script: echo checked\n' > "$test_dir/config with spaces.yml"

cat > "$test_dir/bin/glci" <<'STUB'
#!/usr/bin/env bash
printf 'glci %s\n' "$1" >> "$CALL_LOG"
case "$1" in
  lint) [ "$#" = 4 ] && [ "$2" = --quiet ] && [ "$3" = -f ] && [ "$4" = "$CI_FILE" ] || exit 99
        exit "$LINT_EXIT" ;;
  show) [ "$#" = 3 ] && [ "$2" = -f ] && [ "$3" = "$CI_FILE" ] || exit 99
        exit "$SHOW_EXIT" ;;
  run)  [ "$#" = 4 ] && [ "$2" = --simulate ] && [ "$3" = -f ] && [ "$4" = "$CI_FILE" ] || exit 99
        exit "$RUN_EXIT" ;;
  *) exit 99 ;;
esac
STUB
cat > "$test_dir/bin/docker" <<'STUB'
#!/usr/bin/env bash
printf 'docker %s\n' "$1" >> "$CALL_LOG"
[ "$1" = info ] || exit 99
exit "$DOCKER_EXIT"
STUB
cat > "$test_dir/bin/git" <<'STUB'
#!/usr/bin/env bash
case "$*" in
  'rev-parse --is-inside-work-tree') exit 0 ;;
  'rev-parse HEAD') exit "$COMMITS_EXIT" ;;
  *) exit 99 ;;
esac
STUB
chmod +x "$test_dir/bin/"*

export PATH="$test_dir/bin:$PATH"
export CI_FILE="$test_dir/config with spaces.yml"
export CALL_LOG="$test_dir/calls"
failures=0
check_case() {
  local name="$1" expected_exit="$7" expected_calls="$8" actual_exit=0
  export LINT_EXIT="$2" SHOW_EXIT="$3" DOCKER_EXIT="$4" COMMITS_EXIT="$5" RUN_EXIT="$6"
  : > "$CALL_LOG"
  bash "$verify_script" -f "$CI_FILE" auto > "$test_dir/output" 2>&1 || actual_exit=$?
  if [ "$actual_exit" != "$expected_exit" ] || [ "$(cat "$CALL_LOG")" != "$expected_calls" ]; then
    printf 'FAIL: %s (exit %s, expected %s)\n' "$name" "$actual_exit" "$expected_exit"
    cat "$CALL_LOG" "$test_dir/output"
    failures=$((failures + 1))
  else
    printf 'PASS: %s\n' "$name"
  fi
}

check_case 'lint failure stops before show' 2 0 0 0 0 2 'glci lint'
check_case 'lint preserves any nonzero status' 37 0 0 0 0 37 'glci lint'
check_case 'show failure stops before Docker' 0 2 0 0 0 2 $'glci lint\nglci show'
check_case 'show preserves any nonzero status' 0 37 0 0 0 37 $'glci lint\nglci show'
check_case 'success without Docker' 0 0 1 0 0 0 $'glci lint\nglci show\ndocker info'
check_case 'success without commits' 0 0 0 1 0 0 $'glci lint\nglci show\ndocker info'
check_case 'simulation succeeds' 0 0 0 0 0 0 $'glci lint\nglci show\ndocker info\nglci run'
check_case 'simulation failure propagates' 0 0 0 0 1 1 $'glci lint\nglci show\ndocker info\nglci run'
[ "$failures" = 0 ]
