# gitlab-ci-skill

An [Agent Skill](https://agentskills.io) that helps developers author, debug, and optimize GitLab CI/CD pipelines from any AI editor. No GitLab account or GitLab Duo required.

## Status

gitlab-ci-skill is an experimental GitLab project .v1 launched 2026-05-22. Public release tracking issue: [`gitlab-org/gitlab#600546`](https://gitlab.com/gitlab-org/gitlab/-/issues/600546). All four workflows (Create, Add, Debug, Optimize) plus the GitLab onboarding handoff are wired in.

## What it does

When invoked, the skill helps an AI agent (Claude Code, Cursor, opencode, VS Code, OpenCode, Codex):

1. Detect a repo's stack (language, package manager, test runner) and draft a working `.gitlab-ci.yml` shaped as `build`, `test`, `deploy`.
2. Validate the `.gitlab-ci.yml` offline via [`glci`](https://gitlab.com/gitlab-org/ci-cd/runner-tools/glci) (preferred) or `glab ci lint` (fallback).
3. Run the pipeline locally via `glci run` for full-fidelity execution before push.
4. Add jobs to an existing pipeline while matching the project's existing patterns (base jobs, stage placement, rules style).
5. Debug a failing pipeline from either a GitLab pipeline URL or a `glci run` log.
6. Optimize an existing pipeline with caching, DAG via `needs:`, and `parallel:matrix`.
7. Walk a brand-new GitLab user through creating a project, pushing, and finding the pipeline in the GitLab UI.

## Sample output

Given a fresh clone of a Python project (`pyproject.toml`, `uv.lock`, tests) with no `.gitlab-ci.yml`, the skill detects the stack, drafts the pipeline, and renders the graph locally via [`glci`](https://gitlab.com/gitlab-org/ci-cd/runner-tools/glci) before suggesting commit:

```
Pipeline: 5 jobs across 2 stages

  ○ pending  ● running  ✓ passed  ✗ failed  ▶ manual  ⊘ skipped  ⚠ allow_failure

  build     test
  ───────── ─────────
  ○ build   ○ docs
            ○ lint
            ○ test
            ○ typing
```

The graph is generated entirely offline (no GitLab account, no push). See [`examples/python-click/.gitlab-ci.yml`](examples/python-click/.gitlab-ci.yml) for the full file. Idiomatic patterns the skill applies by default: `default:` block for shared fields, hidden `.tox` job with `extends:` reuse across 4 callers, lockfile-keyed cache, `needs: []` so test-stage jobs fan out from the start, schedule-gated full matrix.

For an existing pipeline, the skill also adds jobs (`include: component:` from the GitLab CI Catalog, pinned to release tags), debugs failures from pasted job logs or `glci` reproductions, and proposes optimizations as before/after diffs. See [`examples/python-uv-tox/.gitlab-ci.optimized.yml`](examples/python-uv-tox/.gitlab-ci.optimized.yml) for a Workflow 4 capture with the optimization rationale in the header.

## Scope

**Currently covers:**

- Common single-stack repos: Node, Python, Go, Ruby, Rust, Dockerfile build/push
- Pipeline shape: `build`, `test`, `deploy` (matches GitLab's canonical quick-start example)
- Idiomatic GitLab patterns: hidden jobs + `extends:`, `default:` for shared fields, `workflow:rules:` for pipeline gating
- CI/CD Catalog component recommendations (curated snapshot of GitLab-maintained components)
- Local validation via `glci lint` and local execution via `glci run`

**Not yet covered:**

- Multi-stack monorepos
- Server-side concerns (protected branches, approvals, merge trains, policy)
- Reusable pipeline composition beyond `include:` + `extends:`

## Installation

This skill follows the [Agent Skills open standard](https://agentskills.io/specification). Install by copying the `gitlab-ci-skill/` directory into your skill discovery path:

| Tool | Path |
|---|---|
| Claude Code | `~/.claude/skills/gitlab-ci-skill/` |
| opencode | `~/.config/opencode/skills/gitlab-ci-skill/` (also picks up the Claude path) |
| Project-local | `.claude/skills/gitlab-ci-skill/` or `.opencode/skills/gitlab-ci-skill/` |
| Cross-tool (open standard) | `~/.agents/skills/gitlab-ci-skill/`, picked up by Claude Code, opencode, Cursor, GitLab Duo CLI, and any tool implementing the Agent Skills specification |
| GitLab Duo CLI (Linux/macOS) | `~/.gitlab/duo/skills/gitlab-ci-skill/` |
| GitLab Duo CLI (Windows) | `%APPDATA%\GitLab\duo\skills\gitlab-ci-skill\` |

For GitLab Duo workspace-level skills, place at `skills/gitlab-ci-skill/SKILL.md` inside a project repository.

## Project structure

```
gitlab-ci-skill/
├── SKILL.md                Entry point: workflows, principles, output format
├── references/             Detailed reference docs loaded as needed
│   ├── mental-model.md         GitLab's 4-step CI/CD mental model
│   ├── syntax.md               Curated keyword set the skill produces
│   ├── recipes.md              Per-stack starter pipelines (build/test/deploy)
│   ├── images.md               Picking the right image per stack
│   ├── caching.md              Cache keys, paths, scopes
│   ├── catalog.md              CI/CD Catalog components, version pinning
│   ├── verification.md         glci verification ladder (lint/show/simulate/run)
│   ├── debugging.md            Workflow 3 flow + failure-shape catalog
│   ├── optimize.md             Workflow 4 flow + optimization playbook
│   └── onboarding.md           Creating a GitLab project, first push
├── scripts/
│   ├── verify.sh           Tier-aware verification (auto/lint/show/simulate/run)
│   └── catalog-search.sh   Live Catalog GraphQL query
└── examples/               Reference repos used by CI to gate end-to-end
```

## Companion tools

- [`glci`](https://gitlab.com/gitlab-org/ci-cd/runner-tools/glci): the workhorse. Lints, renders the pipeline graph (`glci show`), simulates execution, and runs `.gitlab-ci.yml` locally against the production `gitlab-runner` image. No GitLab account required.
- [`glab`](https://gitlab.com/gitlab-org/cli): the official GitLab CLI. Used as a `glab ci lint` fallback when `glci` is not installed.
- [Sister skill: `github-actions-to-gitlab-ci`](https://gitlab.com/gitlab-org/ci-cd/github-actions-to-gitlab-ci): translates GitHub Actions workflows to GitLab CI/CD pipelines. Paired with this skill for users coming from GitHub.

## Related work

This skill is the portable counterpart to GitLab's [CI Expert Agent](https://docs.gitlab.com/user/duo_agent_platform/agents/foundational_agents/ci_expert_agent/), which runs inside GitLab Duo (see its [AI Catalog entry](https://gitlab.com/explore/ai-catalog/agents/1004583/)). The CI Expert Agent applies the same authoring, debugging, and optimization patterns in-product. This skill ports those patterns out as an Agent Skill so any AI editor can load them without a Duo subscription or a GitLab account.

## Contributing

Issues and merge requests welcome.

## License

MIT. See `LICENSE`.
