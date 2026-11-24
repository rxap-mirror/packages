# Package review (`tools/scripts/review.sh`)

An AI review of the RxAP packages in dependency order. Every package is reviewed by its own Claude instance with five specialist reviewers. Leaves go first, so each package's reviewer already has the findings of its dependencies. It can then separate **its own problems** from **problems inherited from a dependency**.

---

## Quick guide

```bash
# 1. See what would be reviewed, and in which order (free)
tools/scripts/review.sh --root-prefix packages/nest --tags scope:utilities --dry-run

# 2. Review it
tools/scripts/review.sh --root-prefix packages/nest --tags scope:utilities --model sonnet

# 3. Read the result
open review-reports/<timestamp>/index.md
```

`pnpm review …` works too.

### Recipes by goal

| Goal | Command | Notes |
|---|---|---|
| **First look / triage** of an area | `review.sh --root-prefix packages/angular --model sonnet --concurrency 4` | Static reading only, so it's fast. About $1.50 per package with Sonnet. |
| **Deep audit** of a small, important scope | `review.sh --projects utilities,mixin --with-deps --model opus --run-tests --budget-usd 8` | `--run-tests` adds real lint/test/build results as evidence. Opus finds more but costs several times as much. |
| **Bug hunt with proof** (tests land in an MR) | `review.sh --tags scope:core --model opus --write-tests --budget-usd 10 --concurrency 2` | Writes `it.failing` specs that reproduce bugs and opens a draft MR. Keep concurrency low, because parallel `nx test` runs are heavy. |
| **Regular re-check** (weekly, or after a refactor) | `review.sh --root-prefix packages/nest --incremental --model sonnet` | Packages that didn't change since their last report are reused for free. Changed packages get a "fixed / still open" comparison. |
| **Check one package after fixing it** | `review.sh --projects nest-utilities --model sonnet` | The report lists which of the previous findings are now fixed. |
| **Full workspace, spread over days** | `review.sh --model sonnet --incremental --total-budget-usd 20`, then `--resume <dir> --total-budget-usd 20` as often as needed | See [Cost control](#cost-control). |
| **Experiment with agent teams** | `review.sh --projects utilities --teams` | Needs `tmux`. Has no budget cap. See [Teams mode](#teams-mode). |

### Cost control

Measured with Sonnet on small packages (`utilities`, `mixin`): **$1.30–$1.70 and 2–3 minutes per package**, static review only. `--run-tests`, `--write-tests` and Opus increase this. Opus costs a multiple of Sonnet; run a pilot before a big Opus run.

There are two separate caps:

| Flag | Scope | What happens when it's reached |
|---|---|---|
| `--budget-usd N` (default 5) | **one package** | That package's review stops and is recorded as *failed*. |
| `--total-budget-usd N` | **the whole run** | No new packages are started; the ones already running finish. The rest show as "not started". |

Both only work in the default (print) mode. Costs are Claude Code's client-side estimate.

**Recommended workflow for big scopes** (it keeps you from draining your token or rate limits in one go):

```bash
# 0. Order and size of the selection (free)
tools/scripts/review.sh --root-prefix packages/angular --dry-run

# 1. Pilot: 2–3 packages, to calibrate the cost per package
tools/scripts/review.sh --projects angular-utilities,angular-pipes --model sonnet

# 2. First slice: stop after about $5
tools/scripts/review.sh --root-prefix packages/angular --model sonnet --total-budget-usd 5
#    → "Continue with: tools/scripts/review.sh --resume review-reports/<id> …"

# 3. Continue later with another $2, $5, … until everything is done
tools/scripts/review.sh --resume review-reports/<id> --root-prefix packages/angular --model sonnet --total-budget-usd 2

# 4. Weeks later: only re-review what changed
tools/scripts/review.sh --root-prefix packages/angular --model sonnet --incremental
```

How the budget flags interact with `--resume`:
- `--resume` skips every package that already has a report in that run directory.
- **Failed** and **not started** packages are reviewed again **from scratch**. A failed package does not continue where it stopped.
- If a package failed because it hit `--budget-usd`, raise that cap on resume, e.g. `--budget-usd 8`. Otherwise it will fail the same way again.
- `--total-budget-usd` counts only what is spent in the current invocation.
- Packages are started level by level. When the total cap is reached in the middle of a level, the higher levels are not started either. They need their dependencies' reports first.

More ways to save:
- **`--incremental`** is the biggest saver for repeated runs. Unchanged packages cost $0.
- Use **`--model sonnet`** for breadth and Opus only for small, critical scopes.
- **Lower `--concurrency`** if you use a subscription with rate limits. Concurrency doesn't change the total cost, only how fast you spend it.
- **Narrow with tags.** If a tag doesn't match, the error lists the tags that exist under the prefix:
  ```
  ✗ no project under "packages/nest/" matches the selection
    tags under this prefix: libs (2), nest (21), packages (21), scope:core (1), scope:integration (6), scope:utilities (2)
  ```

---

## How it works

```
nx graph ──► restrict to --root-prefix ──► filter by tags/projects ──► levels (leaves first)
                                                                          │
                       ┌──────────────────────────────────────────────────┘
                       ▼
   for each level (packages in parallel, --concurrency):
     claude (lead) ── gets: package info + dependency findings + previous findings
       ├─ review-api          ┐
       ├─ review-correctness  │ specialists in parallel
       ├─ review-tests        │ (subagents, or teammates with --teams)
       ├─ review-deps         │
       └─ review-docs         ┘
     lead merges, deduplicates and classifies → JSON (schema.json) → <package>.md
```

### Dependency order
- The graph comes from `pnpm nx graph --file=…`. Only **static** dependency edges are used. In this workspace the implicit edges are aggregate ones (`rxap`, the `angular` demo app, `schematic-composer`, …). They would turn umbrella projects into hubs and break the leaf-first order.
- **Level 0** holds packages with no selected dependencies. A package is in level *n* when all its selected dependencies are in lower levels.
- A level starts only when the previous one is done, so every dependency's report exists before its dependents are reviewed.
- Dependencies **outside** the selection don't affect the order. Their newest report from an *earlier* run is still given to the reviewer as context, labelled with its age (see [History](#history-and-incremental-runs)).

### Internal vs. dependency issues
Every finding has an `origin`:
- **`internal`**: the defect lives in this package. *Misusing* a dependency's API also counts as internal.
- **`dependency`**: the root cause is a defect or a bad contract inside a dependency. The finding names the `dependency`. If the dependency's report already lists the problem, `upstreamFindingId` links to it, e.g. `utilities-023`, and the finding only describes the effect on this package.

### The five review areas (`.claude/agents/review-*.md`)

| Agent | Focus |
|---|---|
| `review-api` | Public exports, typing, naming, Angular/NestJS conventions, breaking-change risks |
| `review-correctness` | Bugs, edge cases, async/RxJS mistakes, error handling, security |
| `review-tests` | Coverage and spec quality. Runs lint/test/build with `--run-tests`, and writes reproducing specs with `--write-tests` |
| `review-deps` | How the package uses its dependencies: `package.json` correctness, deep imports, assigning problems to the right package |
| `review-docs` | README, JSDoc, generator and schematic docs |

The lead runs all five in parallel, merges the results, and checks every critical or high finding in the code itself before keeping it.

---

## Flag reference

**Selection**

| Flag | Default | Description |
|---|---|---|
| `--root-prefix <path>` | `packages/` | Only projects whose root starts with this path, e.g. `packages/angular/`. A trailing `/` is added automatically. |
| `--tags a,b` | – | Only projects that have these Nx tags. |
| `--match all\|any` | `all` | `all`: a project must have every tag. `any`: one tag is enough. |
| `--projects p1,p2` | – | Only these projects. They must be under the root prefix. |
| `--exclude p1,p2` | – | Never these projects. |
| `--with-deps` | off | Also review the dependencies of the selection, direct and indirect, within the root prefix. |

**Execution**

| Flag | Default | Description |
|---|---|---|
| `--model <alias\|id>` | Claude Code default | Model for the lead and the specialists (`sonnet`, `opus`, …). |
| `--concurrency N` | 4 | How many packages are reviewed in parallel within a level. |
| `--budget-usd N` | 5 | Cost cap per package (print mode only). |
| `--total-budget-usd N` | – | Cost cap for the whole run. After it's reached, no new packages start (print mode only). |
| `--run-tests` | off | Let the reviewers run `pnpm nx run <project>:lint\|test\|build`. |
| `--write-tests` | off | Let the reviewers write reproducing specs. Implies `--run-tests`. See [Reproducing tests](#reproducing-tests-and-the-merge-request). |
| `--no-mr` | off | With `--write-tests`: keep the branch local and don't push or open an MR. |
| `--mr-target <branch>` | current branch | Target branch of the MR. |
| `--teams` | off | Agent teams in `tmux` instead of `claude -p` with subagents. |
| `--timeout-min N` | 60 | Time limit per package in `--teams` mode. |

**Runs and history**

| Flag | Default | Description |
|---|---|---|
| `--out <dir>` | `review-reports/<timestamp>` | Run directory. Its name is also the run id. |
| `--resume <dir>` | – | Continue a run. Packages with a report in `<dir>` are skipped. |
| `--incremental` | off | Reuse a package's newest report when nothing relevant changed. See below. |
| `--dry-run` | – | Print the selection and the levels, then exit. With `--clean`, show what would be deleted. |
| `--clean [--keep N]` | keep 5 | Clean up old runs, worktrees and branches. See [Cleanup](#cleanup). |
| `--help` | – | Print the flag reference. |

---

## Output

```
review-reports/<run-id>/
├── index.md                 # overview table in level order + failed / not started packages
├── <project>.md             # the report per package
├── <project>.json           # structured data (schema.json + _meta), used by later runs
├── mr-description.md        # only with --write-tests
└── logs/
    ├── <project>.log        # prompt + full Claude output (debugging)
    ├── <project>.prompt.md  # --teams only
    └── <project>.teams.sh   # --teams only
```

`review-reports/` is git-ignored.

**`index.md`** has one row per package: level, tags (without the `npm:*` tags), finding counts per severity, internal vs. dependency counts, and lint/test/build status. ♻ marks a report that was reused by `--incremental`.

**`<project>.md`** contains:
1. A header with the root, tags, level, links to the dependencies' reports, the check results and the cost.
2. Warnings, e.g. a reverted change outside the allowed scope, or previous findings that got no status.
3. **Summary**.
4. **Since the last review**: how many previous findings are fixed, obsolete or still open (only when there was a previous report).
5. **Internal issues**, grouped by severity.
6. **Issues from dependencies**, grouped by severity, with links to `<dependency>.md#<finding-id>`.

Each finding shows its id, severity, category, `file:line`, a description, evidence (output or code), a suggested fix, and the spec path if a test was written.

---

## History and incremental runs

Every `<project>.json` carries `_meta`:

```json
{ "project": "utilities", "runId": "2026-10-10T09-28-30", "commit": "0ee7eea…", "dirty": false,
  "reviewedAt": "2026-10-10T09:31:43.817Z",
  "options": { "runTests": false, "writeTests": false, "model": "sonnet", "teams": false } }
```

`dirty: true` means the package folder had uncommitted changes when it was reviewed, so the commit alone doesn't describe what was reviewed.

Earlier runs are used in three ways:

1. **Dependency context.** When a dependency isn't part of the current run, or its review failed in this run, its newest earlier report is used. The reviewer sees how old it is, e.g. *"run X, commit abc1234, 3 file(s) changed since"*, and is told to check findings against the current code.
2. **Previous findings of the package itself.** The reviewer first does a **fresh** review, so the old list doesn't steer it. Then it checks every previous finding and marks it `fixed`, `open` or `obsolete`. Findings that are still open **keep their id**, so ids stay comparable across runs. Previous findings that get no status are flagged as a warning in the report.
3. **`--incremental`.** A package's newest report is reused without a new review when **all** of these hold:
   - Neither the package nor any of its dependencies (direct or indirect, any root) changed since that report's commit. Uncommitted and untracked files count as changes.
   - That report was not `dirty`.
   - It was made with at least the same `--run-tests`/`--write-tests` setting. A static report is not reused for a `--run-tests` run.

---

## Reproducing tests and the merge request

With `--write-tests`:

1. A worktree `.claude/worktrees/review-<run-id>` is created on branch `review/<run-id>`, starting from the current `HEAD`. Your own checkout is never touched. `node_modules` is linked from the main checkout.
2. For critical or high correctness findings, `review-tests` writes a focused `*.spec.ts` **inside the package folder** and runs it:
   - **Fails** because of the bug → the bug is proven. The test is turned into **`it.failing(...)`** with a `// package review: <title>` comment.
   - **Passes** → the suspicion was wrong. The test is deleted and the finding dropped or downgraded.
3. After each package, the script **reverts every change that isn't a `*.spec.ts` inside that package** and lists it as a warning in the report. Then it commits the specs: `test(<project>): reproduce package review findings`. The commits skip git hooks.
4. At the end, the branch is **pushed to `origin`** and a **draft MR** is opened with `glab`, targeting the current branch (or `--mr-target`). The description lists every proven finding with its spec path. Afterwards the local worktree and branch are deleted.
5. A `--resume` of the same run reuses the branch, pushes the new commits and **updates** the existing MR's description.

**Why `it.failing`:** the specs are merged while the bugs still exist, and CI must stay green. An `it.failing` test passes as long as the bug is present. It turns **red when someone fixes the bug**, which reminds them to change it into a normal `it(...)`.

If the push or the MR fails, nothing is lost: the branch and worktree stay, and their location is printed. With `--no-mr` they stay local too.

Requirements: `glab` must be logged in for the GitLab project, unless you use `--no-mr`.

---

## Teams mode

Claude Code's **agent teams** (teammates that can message each other and share a task list) **don't work in headless `claude -p` mode**; there, teammates fall back to plain subagents. That's why the default mode uses subagents.

`--teams` instead starts an interactive `claude` session for each package in a detached `tmux` session (`review-<project>`) with `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`:
- The lead creates a team from the same `review-*` definitions.
- The lead writes its JSON to `logs/<project>.teams-result.json`. The script waits for that file, validates it, and then ends the session. The terminal output is appended to the log.
- Watch a session live with `tmux attach -t review-<project>`.

Limitations:
- Needs `tmux`.
- **No cost caps:** `--budget-usd` and `--total-budget-usd` are ignored, and no cost is reported.
- Experimental: the names of the team tools in the allow-list are best guesses. If a session stops at a permission prompt, attach to it and answer.

---

## Cleanup

```bash
tools/scripts/review.sh --clean --dry-run           # show what would be removed
tools/scripts/review.sh --clean --keep 3            # keep the 3 newest runs
```

- **Report runs:** the newest `--keep` runs (default 5) are kept. An older run is also kept while it holds the **newest report of some package**, because `--incremental` and the previous-findings comparison need it. Such a run only loses its `logs/` folder.
- **Worktrees and `review/*` branches** are removed when everything on them is on a remote. The script runs `git fetch --prune origin` first.
- Branches with **unpushed** commits are kept, with a warning. A squash-merged MR also triggers this warning, because git can't see that the specs landed. In that case delete the branch yourself (`git branch -D review/<id>`).

---

## Files

| File | Purpose |
|---|---|
| `tools/scripts/review.sh` | Entry point. Checks that `node`, `claude` and `git` exist. |
| `tools/scripts/review/review.mjs` | Main script: flags, selection, scheduling, worktree, MR, report writing |
| `tools/scripts/review/graph.mjs` | Nx graph export, selection, levels |
| `tools/scripts/review/history.mjs` | Finding earlier reports, change detection (`git diff` since the report commit) |
| `tools/scripts/review/clean.mjs` | `--clean` |
| `tools/scripts/review/runner-print.mjs` | Default mode: `claude -p --json-schema …` |
| `tools/scripts/review/runner-teams.mjs` | `--teams` mode with tmux |
| `tools/scripts/review/prompt.md` | Lead prompt template (`{{PLACEHOLDERS}}`) |
| `tools/scripts/review/schema.json` | JSON schema of a report (findings, checks, previousFindings) |
| `tools/scripts/review/render.mjs` | JSON → Markdown |
| `.claude/agents/review-*.md` | The five specialists |

**Customising:**
- Change a specialist's focus in its `.claude/agents/review-*.md`.
- Change how findings are merged and classified in `prompt.md`.
- New finding fields go in `schema.json` and `render.mjs`.
- Old reports stay readable as long as the existing fields keep their meaning.

**Permissions:** the reviewers run with `--permission-mode dontAsk` and a fixed allow-list. Every tool call outside it is denied, never asked.
- Always allowed: `Read`/`Grep`/`Glob`, subagents, and read-only `git log|diff|show|blame` and `pnpm nx show`.
- `--run-tests` adds `pnpm nx run <project>:lint|test|build`.
- `--write-tests` adds `Write`/`Edit` limited to `<root>/**/*.spec.ts`, plus `pnpm jest`.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `no project under "…" matches the selection` | Wrong tag or prefix. The error lists the tags that exist under the prefix. Tags are case-sensitive and often scoped, e.g. `scope:utilities`. |
| A package fails because it hit the budget (`claude failed (error_max_budget…)`) | The per-package cap was hit. Rerun with `--resume <dir> --budget-usd <higher>`. |
| A package fails with `no JSON result` | Look at `logs/<project>.log`. Common causes: not logged in, a network problem, or a rate limit. Continue with `--resume`. |
| A report says "N finding(s) of the previous review got no status" | The lead skipped some old findings. Check them by hand or re-review the package. |
| `--teams needs tmux in PATH` | Install `tmux`, or use the default mode. |
| A `--teams` session hangs | `tmux attach -t review-<project>`. It's probably waiting at a permission prompt. |
| MR could not be created | Run `glab auth status`. The specs are safe on the printed local branch. Rerun with `--resume`, or push and open the MR by hand. |
| Leftover worktrees or branches | `tools/scripts/review.sh --clean --dry-run`, then without `--dry-run`. |
