---
name: fix-dependency-branch
description: Repair a red pipeline on a dependency update branch (renovate/* or migrate/*) by adapting code, config and tests to the new dependency version — never by changing versions. Runs unattended in the agent:fix CI job (reads .claude-ci/context.md) and can be used locally on a checked-out renovate/* or migrate/* branch. Use when asked to fix a failing Renovate or nx-migrate branch.
---

# Fix a dependency update branch

A Renovate (`renovate/*`) or framework migration (`migrate/*`) branch has bumped one or more dependencies and its
pipeline is red. Your job: make the failing targets green again **by adapting this repository to the new version**.
The version bump itself is fixed and not up for discussion.

## Input

- **CI:** `.claude-ci/context.md` (written by `tools/scripts/agent-fix-context.mjs`) holds the branch, the attempt
  number `<n>`, the merge request, the failed jobs with the last 200 lines of their traces, the migration labels and
  `migrations.json` entries (migrate branches) and the diff stat against the merge base. Read it first.
- **Locally:** if `.claude-ci/context.md` does not exist, build the same picture yourself: `git log --oneline
  origin/development..HEAD`, `git diff --stat $(git merge-base HEAD origin/development)`, and the failed targets the
  user names (or `pnpm nx affected -t lint test build --base=origin/development`). Use attempt number
  `max(existing Agent-Fix trailers) + 1`, starting at 1.

## Hard rules — FORBIDDEN, no exceptions

1. Changing any dependency version or range: no edits to `version`/`dependencies`/`devDependencies`/
   `peerDependencies`/`optionalDependencies`/`overrides`/`resolutions`/`pnpm.*` in any `package.json`, no `pnpm add`,
   `pnpm update`, `pnpm up`, `nx migrate`, no regenerating `pnpm-lock.yaml` (a plain `pnpm install --frozen-lockfile`
   is fine and must not change the lockfile).
2. Touching `pnpm-workspace.yaml` or `tools/scripts/audit-allowlist.json`.
3. Skipping, deleting, `.skip`/`xit`/`.todo`-ing or weakening tests (no loosened assertions, no deleted snapshots
   without a matching code reason), disabling lint rules (`eslint-disable`, rule changes in `eslint.config.*`),
   `@ts-ignore`/`@ts-expect-error`/`any` casts to silence the compiler, or excluding files from builds/tests.
4. `--no-verify` on commit or push, `SKIP_SUPPLY_CHAIN=1`, `HUSKY=0` or any other way around the Husky hooks.
5. Editing CI files (`.gitlab-ci.yml`, `.gitlab/**`), `renovate.json5`, `tools/scripts/**` cooldown/supply-chain
   tooling, or `.claude/**`.

**A red `supply-chain:check` (cooldown or advisory violation) is not fixable here.** Do not try; report it in the MR
note and stop. Same when the only honest fix needs one of the forbidden changes (e.g. a peer range conflict that only
a different version resolves): stop and report what would be needed.

## Steps

1. **Read the context** and decide which failed jobs are caused by the update. Infra failures (runner lost, timeout,
   registry 5xx, OOM) are not code problems: report them, do not commit.
2. **Install** exactly what the lockfile says: `pnpm install --frozen-lockfile`. If that fails, the branch itself is
   broken (lockfile/manifest mismatch) — report and stop.
3. **Reproduce only the failed targets**, one by one: `pnpm nx run <project>:<target>` (take project and target from
   the job trace, e.g. the `run-many` output lists the failed tasks). Do not run the whole workspace — it is slow and
   costs money. Use `--skip-nx-cache` when a cached success hides the failure. Keep parallelism low
   (`--parallel=2`) on the shared runner.
4. **Find the cause in the new version**: read the changelog / migration guide of the bumped package (versions are in
   the diff stat and the MR title; `node_modules/<pkg>/CHANGELOG.md`, the package's `README`, or its type
   definitions). For `migrate/*` branches check whether a listed migration was skipped or failed
   (`migration::failed` / `post-migration::failed` label) and apply its intent by hand.
5. **Fix** the code, configuration (tsconfig, jest/vitest, eslint config *values* that the new version renamed — not
   rule disables) or tests (only where the expected behaviour legitimately changed with the new version; say why in
   the commit body). Smallest change that makes the target green.
6. **Verify**: re-run every target you touched plus the originally failed ones. All must be green. Run
   `git diff --name-only $(git merge-base HEAD origin/development)` against the forbidden list above before committing.
7. **Commit** (Conventional Commits, never a `BREAKING CHANGE` footer or `!`), one commit per logical fix, every
   commit with the trailer of this attempt:

   ```bash
   git add <files>   # explicit paths, never `git add -A` / `.` (the CI checkout has job artifacts lying around)
   git commit -m "fix(<scope>): adapt <what> to <pkg> <version>" -m "<why>" --trailer "Agent-Fix: <n>"
   ```

   Scope = the Nx project name (e.g. `angular-forms`) or `workspace`.
8. **Push** (CI only — locally stop after the commit unless the user asks): `git push origin HEAD:$CI_COMMIT_BRANCH`.
   The remote already carries `GITLAB_TOKEN` (set up by `ciSetupGit`); never print the token or the remote URL. The
   push starts a new pipeline; if that one is red again, the next attempt starts automatically until the cap (2) is
   reached.
9. **MR note** (CI only, skip when the context says there is no MR): one short note via
   `glab mr note <iid> --message "<text>"`:

   ```markdown
   **Agent fix attempt <n>**
   - Fixed: `<project>:<target>` — <one line why>
   - Still open: `<project>:<target>` — <what blocks it / what a human must decide>
   - Not touched: supply-chain:check (cooldown) | infra failure in <job>
   ```

   No note longer than ~15 lines, no trace dumps.

## When nothing can be fixed

Do not commit. Post the MR note with "Still open" entries only and end. An empty attempt does not count against the
cap, but also does not re-trigger the pipeline — a human takes over.
