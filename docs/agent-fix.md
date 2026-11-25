# Agent fix (draft)

When the pipeline of a dependency update branch is red, a Claude Code agent tries to repair it before a human looks
at it. It adapts code, configuration and tests to the new version; it never changes versions.

Covered branches: `renovate/*` (Renovate, `RENOVATE.md`) and `migrate/<pkg>/<version>` (framework watch + the
rxap/gitlab-ci `nx-migrate` job). Framework merge requests never automerge, with or without agent commits.

## Process

1. A merge request pipeline of a `renovate/*` or `migrate/*` branch fails (nx-workspace runs builds and tests of
   these branches only in MR pipelines: branch pipelines are skipped for branches with an open MR and for
   `migrate/*`). The job `agent:fix` (`.gitlab/ci/agent-fix.yml`, stage `.post`, `when: on_failure`) starts and
   works on `CI_MERGE_REQUEST_SOURCE_BRANCH_NAME`. It never runs in `RENOVATE`, `SUPPLY_CHAIN_AUDIT`,
   `FRAMEWORK_WATCH` or `RELEASE_IT` pipelines. `resource_group: agent-fix/<branch>` keeps it to one agent per
   branch.
2. `tools/scripts/agent-fix-context.mjs` decides whether the agent runs at all and prepares its input:
   - **skip** (job ends green, no agent, no cost) when
     - the branch moved on since this pipeline (a newer pipeline decides),
     - a `migrate/*` branch has no open MR (only relevant if the job is ever run in a branch pipeline),
     - the attempt cap is reached → label `agent-fix::gave-up` + MR note listing the failed jobs,
     - only `supply-chain:*` jobs failed (cooldown / advisory) → label `agent-fix::blocked` + MR note;
   - **otherwise** writes `.claude-ci/context.md`: failed jobs of the pipeline and its child pipelines (allowed
     failures ignored) with the last 200 lines of each trace, for `migrate/*` the scoped labels
     (`migration::*`, `post-migration::*`, `migrate::<pkg>`, `<pkg>::<version>`), the `migrations.json` entries and
     the MR description (links to the migrate logs), `git diff --stat` against the merge base with `development`, and
     the attempt number.
3. `.mcp.json` is hidden from the agent (it would start MCP servers via `npx -y …@latest`, bypassing the release
   cooldown), `pnpm install --frozen-lockfile` installs the workspace, then the rxap/gitlab-ci `claude` component runs
   Claude Code through claudish/OpenRouter with the skill `.claude/skills/fix-dependency-branch`.
4. The skill reproduces only the failed targets (`pnpm nx run <project>:<target>`), fixes the cause, re-runs them,
   commits (Conventional Commits, trailer `Agent-Fix: <n>`), pushes to the branch with `GITLAB_TOKEN` and leaves one
   short MR note (fixed / still open). The push starts a new pipeline; if it is red again, the next attempt runs.
5. The log of every run is in the job artifact `.claude-ci/claude.log` (kept 1 week) next to `context.md`.

The skill also works locally on a checked-out branch: ask Claude Code to "fix this dependency branch"; without
`.claude-ci/context.md` it builds the context from git and the failed targets you name, and it does not push.

## Guard rails

The agent must not: change any dependency version or range or regenerate the lockfile, touch `pnpm-workspace.yaml`
or `tools/scripts/audit-allowlist.json`, skip/delete/weaken tests or lint rules, use `--no-verify`,
`SKIP_SUPPLY_CHAIN=1` or `HUSKY=0`, edit CI files. A red `supply-chain:check` is reported, never fixed. The rules are
in the skill and repeated in the job prompt; the Husky `pre-push` gate and `supply-chain:check` in the next pipeline
catch a lockfile change anyway. Review agent commits like any other commit before merging.

The `nx-migrate` job of the branch pipeline ignores commits whose message contains `Agent-Fix:`
(`.gitlab/ci/framework-watch.yml`), so an agent push never re-runs the migration. Keep the trailer format exactly
`Agent-Fix: <n>`.

## Attempt cap

At most **2 attempts per branch** (`AGENT_FIX_MAX_ATTEMPTS`). An attempt is one distinct `Agent-Fix: <n>` trailer
value among the commits since the merge base with `origin/development` (several commits of one attempt share `n`).
An attempt that commits nothing does not count, but it also pushes nothing, so no new pipeline and no loop.

To allow new attempts after `agent-fix::gave-up`: remove the label and drop or squash away the `Agent-Fix` commits
(e.g. let Renovate recreate the branch via the rebase checkbox).

Renovate sees the agent commits (author `rxap agent-fix`) as a manual modification and stops force-rebasing the
branch; the rebase checkbox in the MR still recreates it from scratch, which also resets the attempt count.

## Labels

| Label | Meaning |
|---|---|
| `agent-fix::gave-up` | Cap reached, pipeline still red. A human takes over. |
| `agent-fix::blocked` | Only supply-chain jobs failed; nothing for the agent to fix. |

Create both labels in the project once (scoped labels, so only one `agent-fix::*` is set at a time).

## CI variables

| Variable | What | Settings |
|---|---|---|
| `GITLAB_TOKEN` | Project access token (role Developer, scopes `api`, `write_repository`). Pushes the fix (a push with the job token would not start a pipeline), reads job traces, sets labels and notes. | masked; protected only if `renovate/*` and `migrate/*` are protected branches |
| `OPENROUTER_API_KEY` | OpenRouter key for claudish. Use a dedicated key **with a monthly spending limit**. | masked |

Optional job variables: `AGENT_FIX_MAX_ATTEMPTS` (default 2), `AGENT_FIX_BASE_BRANCH` (default
`$CI_DEFAULT_BRANCH`). The model comes from the component input `model` (default `openrouter@z-ai/glm-5.3-flash`).

## Activation

1. Add `- local: .gitlab/ci/agent-fix.yml` to the includes of `.gitlab-ci.yml`.
2. Set the CI variables and create the two labels.
3. Watch the first run on a real red Renovate branch (`.claude-ci/claude.log`).

## Known limitations

- Only merge request pipelines trigger the agent; a red branch pipeline without an MR is ignored.
- `when: on_failure` only sees jobs of earlier stages of the same pipeline. A failure in a child pipeline counts
  only if its trigger job uses `strategy: depend`/`mirror`.
- Component jobs: the claude component's own `agent:fix:issue` / `…:epic` jobs are disabled with `when: never`
  rules; they still appear in the merged YAML but never in a pipeline.
- The agent image is Alpine (musl); the lockfile contains the musl variants of the native packages
  (`@nx/nx-linux-x64-musl`, …), but a build that only works on glibc would fail in the agent and not in `run-many`.
- The real run, the push from CI and the OpenRouter cost are only verifiable after the activation.
