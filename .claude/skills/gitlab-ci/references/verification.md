# Verification reference

Detailed handling for `scripts/verify.sh`, glci's verification ladder, and what each tier catches or misses. Load when picking a tier for a specific change, interpreting tier output, or recovering when glci or Docker is missing.

The happy path stays in `SKILL.md` (the "Verifying generated YAML" section and workflows). This file is for the cases that need more than one sentence to explain.

## The four tiers

| Tier | Command (under the hood) | Time | Docker | Network | Catches |
|---|---|---|---|---|---|
| `lint` | `glci lint -f FILE` (falls back to `glab ci lint`) | <1s | no | no | YAML syntax, include resolution, `needs:` references, stage names, timeout format, no cycles |
| `show` | `glci show -f FILE [--json] [--context X]` | 1 to 2s | no | no | `rules:` evaluation under a given context, DAG shape, `parallel:matrix` expansion, which jobs actually run |
| `simulate` | `glci run --simulate -f FILE` | 5 to 30s | yes | optional | full execution plan, artifact flow, variable interpolation, expanded matrix. Scripts echoed, services skipped, dummy artifacts |
| `run` | `glci run [job...] -f FILE` | 30s to minutes | yes | yes for components | image pulls, service startup, script runtime, cache, artifact upload, real outputs |

The commands check different things: `show` can render a configuration that `lint` rejects. The recommended `auto` tier therefore runs `lint`, then `show`, and stops on either failure. It proceeds to `simulate` only when Docker is reachable and the repository has commits.

## Tier selection by change type

Pick the cheapest tier that catches a regression for the kind of change you made.

| Change | Cheapest tier |
|---|---|
| YAML syntax | lint |
| `needs:` references a job that doesn't exist | lint |
| Circular `needs:` dependency | lint |
| `rules:` expression syntax | lint |
| Stage missing from `stages:` | lint |
| Include path or component ref doesn't resolve | lint |
| New job's `rules:` doesn't fire in the context you expected | show |
| Parallel matrix produced the wrong shape | show |
| `workflow:rules:` blocks the pipeline entirely | show |
| Component swap dropped jobs from the graph | show |
| `needs:` artifact flow broken across stages | simulate |
| Variable interpolation fails (`$VAR` empty when used) | simulate |
| Custom image fails to pull | run |
| Script exits non-zero | run |
| Service container fails to start | run |
| Cache key mismatch (cold cache rebuilt every run) | run |
| Real test failure | run |

For Workflow 2 (adding one job or swapping a component), the most useful incremental check is `glci run <new-job> --reuse-artifacts`: it runs only the changed piece, reusing any cached upstream artifacts.

## verify.sh exit codes

| Exit | Meaning | Skill action |
|---|---|---|
| 0 | Verification passed at the requested tier | Present the YAML to the user |
| Nonzero | A verification command failed; its status is preserved | Read stderr, identify the failed command and propose a fix |
| 2 from the wrapper itself | Setup problem (missing tool, Docker down, missing opt-in flag) | Surface what's missing and recommend a fix |

Do not classify the failure from the exit code alone. For example, `glci lint` and `glci show` also exit 2 for malformed YAML. Report their diagnostic instead of telling the user to repair the environment.

## Output parsing

### `glci lint` (lint tier)

Plain text to stderr on failure. Exit 0 on success. Common error shapes:

```
job "test" needs "build" which does not exist
job "deploy" has invalid timeout "xyz": time: invalid duration "xyz"
```

Extract the offending job name and the missing reference; map to a one-line fix suggestion. If `verify.sh lint` fell back to `glab ci lint` (glci absent), errors come from the GitLab API and have a different shape (typically a single error message per file rather than a list).

### `glci show` (show tier)

Default output is an ASCII pipeline graph with stages, jobs, DAG arrows, and status symbols. Use `--json` for structured output:

```
scripts/verify.sh show --json
```

The JSON contains `stages` (array) and `jobs` (array of `{name, stage, when, allow_failure, image, ...}`). Compare before/after JSON to spot DAG changes in Workflow 4 (Optimize). The `--context` flag accepts `branch=NAME`, `merge_request`, `tag=NAME`, `env=NAME`, or a preset from `.glciconfig.toml`; defaults to `merge_request`.

### `glci run --simulate` (simulate tier)

TUI-style log streaming during execution. Each job prints `[simulate] $ <command>` lines instead of running the real commands. Dummy artifacts are produced so downstream jobs see the artifact files exist. Final summary: `✓ Pipeline PASSED` or per-job failure detail.

After the run, fetch any specific job's log via `glci log <pipeline-id> <job-name>` (the pipeline id is shown in the streamed output; the latest pipeline is the default).

### `glci run` (run tier)

Same streaming format as simulate, but with real script output. Exit 0 success, 1 job failure, 2 system error (per glci's documented exit codes). Use `glci log` to retrieve a single job's trace cleanly after the run completes; live streaming interleaves output across parallel jobs and is harder to parse.

## Degradation when glci is missing

`scripts/verify.sh` handles this differently per tier:

- **lint tier**: falls back to `glab ci lint`. The `glab` backend needs a GitLab project context (the lint API is per-project). verify.sh resolves the project from, in order: a `--project <group/project>` flag, the `VALIDATE_PROJECT` env var, or the git remote (when the user is inside a GitLab checkout). If none resolves, lint exits 2 with three options for the user: install glci instead (recommended, offline, no project required), set `VALIDATE_PROJECT`, or pass `--project` explicitly. Users on non-GitLab remotes (GitHub, Bitbucket, Codeberg) should lead with glci because the glab fallback cannot work without an explicit project.

  **Constraint: lint context must be the user's own project.** The project the lint backend resolves to (via `--project`, `VALIDATE_PROJECT`, or git remote) determines which CI config the lint API uses to resolve includes and which runners are referenced. Using an arbitrary upstream project (e.g., `gitlab-org/gitlab`) as the lint context is incorrect: the lint output reflects that project's configuration, not the user's. If no project resolves and glci is not installed, do not pick an upstream project to "make lint work". Tell the user: "Lint context could not be resolved. Install glci (offline, no project required) or set `VALIDATE_PROJECT=<your-group>/<your-project>` and re-run."

- **show, simulate, run tiers**: glci has no fallback (`glab` does not implement `show` or local execution). verify.sh exits 2 with an install pointer:

  ```
  curl -fsSL https://gitlab.com/gitlab-org/ci-cd/runner-tools/glci/-/raw/main/install.sh | bash
  ```

  (Or the releases page: <https://gitlab.com/gitlab-org/ci-cd/runner-tools/glci/-/releases>.) Do not run the install command for the user without their explicit consent; even with consent, prefer asking the user to run it themselves. Once installed, re-run verify.sh.

When glci is missing and the user is in a hurry, lint-only verification is still meaningful. Present the YAML with the explicit caveat: "Lint passed; I could not render the pipeline graph because glci is not installed."

### Example degradation reports

Concrete templates the agent should mirror when reporting that a tier was skipped. `verify.sh` already prints the relevant facts to stderr; the agent's job is to surface them in this shape, not summarize them. See `SKILL.md` "When a verification tier is skipped" for the four-part format.

#### Docker not reachable (most common, from `verify.sh auto`)

> Local lint and pipeline graph checks passed.
>
> Two tiers didn't run:
> - `glci run --simulate` would have caught artifact-flow regressions and variable interpolation bugs.
> - The smoke run (one job, real execution) would have caught image-pull failures, missing binaries in the image, and runtime script issues.
>
> Reason: Docker daemon is not reachable on this machine.
>
> To unblock locally (paste verbatim from verify.sh stderr; different per OS):
>
> ```
> brew install colima docker && colima start
> ```
>
> Or Docker Desktop: <https://www.docker.com/products/docker-desktop>
>
> Then re-run: `bash scripts/verify.sh auto -f .gitlab-ci.yml`
>
> Alternative: push the YAML to GitLab and let hosted runners run the pipeline. You don't need local Docker to ship this.

#### glci not installed (from any tier above lint)

> Lint passed via the glab fallback; the YAML's syntax is valid.
>
> Three tiers didn't run:
> - `glci show` would have rendered the pipeline graph (DAG, stages, parallel matrix expansion).
> - `glci run --simulate` would have validated artifact flow and variable interpolation.
> - The smoke run would have exercised image pulls and scripts.
>
> Reason: glci is not installed on this machine.
>
> To unblock (offline, no GitLab account required):
>
> ```
> curl -fsSL https://gitlab.com/gitlab-org/ci-cd/runner-tools/glci/-/raw/main/install.sh | bash
> ```
>
> Then re-run: `bash scripts/verify.sh auto -f .gitlab-ci.yml`

#### Repo has no commits yet (from simulate / run tiers)

> Lint and show passed.
>
> The simulate and run tiers need at least one commit (glci's embedded gitlab-runner panics on commit-less repos; see verify.sh preflight).
>
> Reason: this repo has no commits yet (`git rev-parse HEAD` fails).
>
> To unblock:
>
> ```
> git add -A && git commit -m "Initial commit"
> ```
>
> Then re-run: `bash scripts/verify.sh auto -f .gitlab-ci.yml`

Do not paraphrase the install commands; copy them from verify.sh stderr. Different OSes get different commands (macOS shows Colima + Docker Desktop options; Linux shows get.docker.com).

### No shell access

Some hosts (web-only chat surfaces, read-only review agents, sandboxed environments without shell access) cannot invoke `bash` or run verify.sh. In that case:

- Skip the script invocation; do not pretend it ran.
- Tell the user that local verification was skipped (agent has no shell access).
- Tell the user to validate the YAML in the GitLab UI: **Build > Pipeline editor > Validate**. Zero local tooling required.
- Recommend installing glci for future runs so subsequent verifications get show, simulate, and run.

### Broken glci binary

Manual installs via `sudo mv` can preserve a non-executable mode and silently produce an inert binary. verify.sh checks standard locations (`/usr/local/bin/glci`, `/opt/homebrew/bin/glci`, `~/bin/glci`, `~/.local/bin/glci`) and exits 2 with `chmod +x <path>` guidance when it finds a non-executable file. If the user reports "glci not found" but installed glci recently, they may need this fix.

## Degradation when Docker is missing or unreachable

Lint and show do not need Docker; they keep working. Simulate and run exit 2 if `docker info` fails. The error tells the user to start Docker Desktop (or the daemon). For a deeper environment report, the user can run `glci doctor`, which checks Docker reachability, daemon state, token configuration, CI config parsing, and the git repository.

Note: `glci doctor` exits 0 even when individual checks fail (it reports pass/fail symbols but doesn't gate exit code on the results). `verify.sh` does not rely on doctor's exit code; instead it uses a cheap `docker info` check before invoking simulate or run, then surfaces glci's own error if simulate or run fails for any other reason.

## Higher tiers need an initial commit

The `auto`, `simulate`, and `run` tiers spin up the embedded gitlab-runner inside Docker. gitlab-runner crashes on commit-less git repos with:

```
panic: runtime error: slice bounds out of range [:8] with length 4
```

Root cause: glci falls back to `Ref = "main"` when `git rev-parse HEAD` fails, and the upstream gitlab-runner tries to slice the ref to 8 characters. `"main"` has 4. Upstream bug, surfaces in the embedded runner.

**`verify.sh` preflights this**: before invoking `glci run` (in `auto`, `simulate`, or `run` tier), it checks `git rev-parse HEAD`. If the repo has no commits, the script refuses with exit 2 and tells the user to commit first. `lint` and `show` are unaffected and run fine on commit-less repos.

When the user has just done `git init` and not yet committed (common in Workflow 5 onboarding scenarios), the skill should:

1. Run `verify.sh show` first; the rendered graph is still useful.
2. Offer to create the initial commit:

   > "Your repo doesn't have a commit yet, which is fine, but glci needs one to run the pipeline locally. Want me to stage these files and commit them as 'Initial commit'? After that I can simulate the pipeline."

3. Wait for explicit permission per principle 5 (ask before destructive changes). Do not auto-commit.
4. After the commit lands, re-run `verify.sh auto`.

## Components that need a token

The Limitations section of glci's own SKILL.md states:

> `include: project:` and `include: component:` require `GITLAB_TOKEN`

This applies even to public Catalog components. If the YAML uses `include: component:` and `GITLAB_TOKEN` is not set in the environment, lint succeeds (the syntax is valid) but show/simulate/run fail at the include-resolution step with an authentication error.

When you generate or modify YAML that uses a Catalog component, preflight by checking `GITLAB_TOKEN` in the environment. If not set:

- For verification: tell the user to set `GITLAB_TOKEN` before running show or higher. The token only needs read access to the Catalog component's project (any GitLab.com account works for public components).
- Do not block presenting the YAML on this; the YAML itself is fine.

**The skip-without-token state is verification-complete**, not a failure mode. When glci emits `skipping component include ... no GitLab token configured`, the structural file-level verification (everything except the component's contributed jobs) is sound. Do not attempt to resolve the component locally to "fix" the skip warning. Instead:

1. Paste the skip-warning-bearing `glci show` output verbatim.
2. Tell the user: "Local glci cannot resolve Catalog components without a token. GitLab will resolve this on push. The structural pipeline shown above is correct."
3. Offer the optional path: set `GITLAB_TOKEN` to a real PAT (instructions in `SKILL.md` Secret handling) and re-run if local resolution is needed.

Never extract a token from local config (e.g., `~/.config/glab-cli/config.yml`) to make this skip go away. `glab` stores tokens encrypted at rest; the read value is ciphertext, not a usable bearer token. See `SKILL.md` "Never extract credentials from local files".

## glci enforces a per-job timeout

`glci run` enforces a per-job timeout via the embedded gitlab-runner. Verified empirically: a job that runs longer than the timeout is killed with `ERROR: Job exceeded the timeout limit of Xs` in the log and a pipeline failure.

**Default**: 1 hour (3600 seconds) per job, hardcoded in glci's `pkg/runner/jobspec.go` as the fallback when neither the YAML `timeout:` keyword nor the `--timeout` CLI flag is set. This matches GitLab.com's project default for job timeout, so it's not a divergence from GitLab.com behavior.

**Why this is a trap anyway**: on a developer laptop running a matrix-heavy pipeline, several jobs share CPU, memory, and disk concurrently. A job that finishes in 10 minutes on a dedicated hosted runner can take 60+ minutes locally under contention, hitting the 1-hour wall. The failure looks identical to a real test failure unless the log is read.

**Triage signal (unambiguous)**: the log contains the literal string `ERROR: Job exceeded the timeout limit of Xs`. The model should grep for `exceeded the timeout limit` in the run output. This is a deterministic signal, not a heuristic.

**Triage moves**:

1. Rerun the suspect job in isolation: `scripts/verify.sh run <job> --reuse-artifacts --confirm-docker`. Reusing upstream artifacts removes upstream contention; if the job passes solo, the failure was local concurrency, not the code.
2. Raise the timeout if the job legitimately runs longer than 1 hour: `glci run <job> --timeout 2h -f .gitlab-ci.yml`. Accepts CI durations (`30m`, `1h`, `1h30m`). The skill does not change the default; surface the override to the user with an explanation of why.
3. If the job is consistently long-running against a real workload (e.g., a 90-minute integration test), tell the user it likely needs the same treatment on GitLab.com via a YAML `timeout:` keyword on the job. Use show + simulate as the structural confidence layer locally; don't try to run it.

**Distinguish two different timeout mechanisms in glci**:

- **YAML `timeout:` keyword on a job or `default:`**: per glci's own Limitations, this is parsed but **not** enforced by glci (see "What no glci tier catches" below). GitLab.com runners do enforce it.
- **glci's runner-side timeout (1-hour default, overridden by `--timeout` CLI flag)**: enforced locally on every job. This is what fires the trap.

The skill should apply the classification rules in `references/debugging.md` after any failed `verify.sh run` and explicitly tag local-timeout failures so the user does not chase a phantom bug in their code.

## Run-tier guardrails

`scripts/verify.sh run` requires the explicit `--confirm-docker` flag. Even with that flag, the skill must refuse to run jobs with side effects unless the user has explicitly approved them per pipeline:

- **`environment:` keys pointing at real environments** (production, staging, etc.): warn that running this locally will trigger any `environment:` hooks. If the user is unsure, skip those jobs (`glci run --skip <job-name>`).
- **`docker push` to external registries**: warn before executing. glci has an embedded registry for jobs that push within the pipeline; if the script pushes to an external registry, that push is real.
- **Manual jobs** (`when: manual`): glci does not auto-run manual jobs unless you pass `--manual <job>` or `--manual-all`. Default to leaving them skipped.

`GITLAB_TOKEN` is forwarded to all jobs as `CI_JOB_TOKEN` by default. This is convenient but means jobs can call the GitLab API with your personal token's scopes. Pass `--no-token` to disable forwarding for sensitive runs.

## What no glci tier catches

These checks can only happen on real GitLab; the skill should warn the user explicitly when their YAML depends on them.

- **Runner tag matching**: glci does not enforce `tags:`. A job that needs a specific runner tag will pass simulate or run locally but may queue indefinitely on GitLab.
- **Protected branch rules**: glci does not enforce branch protection. A job gated by `rules: - if: '$CI_COMMIT_BRANCH == "main" && $CI_COMMIT_REF_PROTECTED == "true"'` will evaluate the variables glci provides; real protection is server-side.
- **Server-only CI variables** (~25 of them per glci's Limitations): `CI_RUNNER_ID`, `CI_RUNNER_TAGS`, `CI_MERGE_REQUEST_ASSIGNEES`, and similar variables that only exist on the server.
- **YAML `retry:` and `timeout:` keywords**: glci parses both but does not enforce them. Real runner behavior may differ. (Distinct from glci's own runner-side `--job-timeout`, which IS enforced locally; see "glci enforces a per-job timeout" above.)
- **Child pipelines** (`trigger: include:`): glci parses but does not execute child pipelines. The parent pipeline's behavior up to the trigger point is verifiable; what the child does is not.
- **Kubernetes executor**: glci is Docker-only. YAML that relies on Kubernetes-specific features (e.g., `tags: [kubernetes]`) will not exercise that path locally.

When the YAML uses any of the above, tell the user explicitly: "Verification passed locally; (specific feature) only exercises on real GitLab."

## Further reading

For the long tail of glci flags, configuration keys, and behaviors (`.glciconfig.toml` schema, named pipeline presets, embedded registry, daemon management, `glci artifacts diff`, environment variables, troubleshooting), read glci's own Agent Skill at `.claude/skills/glci/SKILL.md` in the `gitlab-org/ci-cd/runner-tools/glci` project. That file is the authoritative reference; this file documents only what `scripts/verify.sh` itself uses and how the skill should react.
