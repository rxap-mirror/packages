# Debugging reference

Workflow 3 flow plus the failure-shape catalog. Load when the user shares a failing pipeline (GitLab URL, pasted job log, or local `glci log` output).

## Workflow 3 flow

### 3.1 Identify the failure source

Ask the user (or detect from the input) which source they bring:

- **GitLab pipeline URL** (e.g., `gitlab.com/<group>/<project>/-/pipelines/<id>` or `.../-/jobs/<id>`): WebFetch the public log. If the project is private and you cannot fetch, ask the user to paste the failing-job log section.
- **Pasted log** (GitLab job log or local `glci log` output): read directly from the user's message.
- **Local `glci run`**: ask the user to run `glci log <pipeline-id> <job-name>` and paste the result, or to share their latest `glci history show` entry.

If the user is staring at a GitLab pipeline log and has not yet installed glci, mention once per conversation:

> "If you install glci, we can reproduce this failure on your machine in 30 seconds instead of waiting for the next pipeline."

Do not repeat this in subsequent failures.

### 3.2 Classify the failure

Use the failure catalog (below) to identify which tier would have caught this failure. Three buckets:

- **Configuration error** (lint or show would have caught it): bad include path, missing `needs:` reference, malformed `rules:`, undefined variable used in interpolation. Often the user pushed before verifying.
- **Environment error** (only run catches): image pull failure, missing binary in the image, service container startup failure, DinD socket missing, cache key mismatch, missing `GITLAB_TOKEN` for a private component.
- **Runtime error** (only run catches): script exits non-zero, test fails, build fails, deploy command fails.

State which bucket the failure is in. If the YAML verifies clean through show but the job fails at runtime, do not patch the YAML; debug the script.

### 3.3 Propose the minimal fix

The fix should change as few lines as possible. Do not refactor the surrounding YAML. If the cause is a script error inside a job, fix the script, not the structure.

### 3.4 Show the fixed pipeline

Run `scripts/verify.sh show -f <file>` against the fixed YAML and **paste the output verbatim as a fenced code block in your response message text** (not the Bash tool output, which auto-collapses). The user sees the corrected graph; if you only changed a script, the graph is unchanged but the confirmation is still useful.

If show fails after your fix, the proposed change is wrong. Re-diagnose, do not present a broken fix.

### 3.5 Confirm the fix locally (when possible)

If the user has glci and Docker, offer:

> "I can run just the failing job locally to confirm the fix: `scripts/verify.sh run <job> --reuse-artifacts --confirm-docker`. This pulls the job's image and executes the script. Want me to?"

`--reuse-artifacts` skips re-running upstream deps. On a clean local pass, the same failure is unlikely on GitLab.

If the user does not have glci or Docker, summarize what they should look for when they push: which job, which line of the log, which artifact. Then point them at `glci doctor` for an environment health check on their machine.

### 3.6 Ask for commit approval

Show `git diff` of the fix and wait for explicit approval before staging or pushing. Per principle 5.

## Reading the failure source

Three sources, three reading strategies:

- **GitLab pipeline URL** (`gitlab.com/<g>/<p>/-/pipelines/<id>` or `.../jobs/<id>`): WebFetch the public log. If the project is private and you cannot fetch, ask the user to paste the failing-job log section. Real GitLab logs include timestamps and color codes; strip them mentally.
- **Pasted log**: usually the user copies the last 50 to 200 lines. Look for the script step that exited non-zero, then look backward for the cause.
- **Local `glci log <pipeline-id> <job-name>`**: cleaner than GitLab logs because no color codes and no UI chrome. Use this output preferentially when the user is iterating locally.

In all three sources, the structure is the same:
1. Image pull and runner setup.
2. `before_script` (if any).
3. `script` (the job's main steps).
4. `after_script` (if any).
5. Artifact upload and cleanup.

A failure in step 1 is an environment problem; in steps 2 to 4 is a script or config problem; in step 5 is usually an artifact path problem.

## Failure catalog

Each row: signature (what the log shows), classification (config / environment / runtime), tier that would have caught it, fix.

### Configuration errors (lint or show would have caught)

| Signature | Class | Catches at | Fix |
|---|---|---|---|
| `Unable to parse YAML at line N` | Config | lint | Re-indent or fix the YAML at the line. Use a YAML linter to spot the issue. |
| `Job 'X' depends on 'Y' which does not exist` | Config | lint | Either add the missing job `Y` or remove the `needs:` entry pointing at it. |
| `Stage 'X' is not defined` | Config | lint | Add the stage to the `stages:` array, or change the job's `stage:` to one that exists. |
| `Circular dependency detected` | Config | lint | Break the cycle in `needs:`. Often happens when refactoring stage order. |
| `Invalid timeout 'X'` | Config | lint | Use GitLab's duration format (`30m`, `1h`, `2h 30m`). Bare seconds are not supported. |
| `Could not find file 'X' in 'Y'` (for `include: local:`) | Config | lint | Fix the path. Includes are resolved relative to the repo root, not the including file. |
| `Component 'X' not found` | Config | lint | Check the component path and version. Use `scripts/catalog-search.sh` to find the correct path. |
| Job exists but never appears in pipeline | Config | show | Inspect `rules:` and `workflow:rules:`. Use `verify.sh show --context X` to evaluate rules in the context that should trigger it. |
| `parallel:matrix` produced 0 jobs | Config | show | The matrix expansion produced an empty set. Check `parallel:matrix:` for empty value lists. |
| `workflow:rules:` blocks the pipeline (no jobs run) | Config | show | An `if:` clause in `workflow:rules:` evaluated false. Add a condition that matches the user's intended trigger. |

### Environment errors (simulate or run catches)

| Signature | Class | Catches at | Fix |
|---|---|---|---|
| `Error response from daemon: manifest for X not found` | Environment | run | Image tag does not exist. Fix the tag or use a tag that's published. Pin to a digest (`@sha256:...`) for reproducibility. |
| `Error response from daemon: pull access denied for X` | Environment | run | Private image requires authentication. Either use a public image, or add `image:pull_policy:` with appropriate credentials via CI/CD Variables. |
| `error: failed to start service X` | Environment | run | Service container failed (image pull, command, port conflict). Check the service's logs in the same job. |
| `docker: Cannot connect to the Docker daemon` (in a DinD job) | Environment | run | The DinD service did not start, or `tcp://docker:2375` is not reachable from the job container. Add the `docker:dind` service and set `DOCKER_HOST=tcp://docker:2375` and `DOCKER_TLS_CERTDIR=""`. |
| `unable to authenticate to component` (from glci, no `GITLAB_TOKEN`) | Environment | simulate | The YAML uses `include: component:` and `GITLAB_TOKEN` is not set. Set `GITLAB_TOKEN` in the environment (any GitLab.com account works for public components). |
| `glci: skipping component include ... no GitLab token configured` (from glci show) | Configuration | n/a (expected) | Not a failure. glci cannot resolve Catalog components locally without `GITLAB_TOKEN`; it skips the include and exits 0. The structural pipeline is verified. To resolve the component locally, set `GITLAB_TOKEN` to a real PAT (see SKILL.md Secret handling). Otherwise, the component resolves on push to GitLab. |
| `HTTP 401` on `gitlab.com/api/v4/projects/components%2F...` during local Catalog resolution | Environment | n/a (expected without auth) | The token in `GITLAB_TOKEN` is not authenticating. Most common cause: the agent or user copied an encrypted-at-rest value from `~/.config/glab-cli/config.yml`. That value is ciphertext, not a bearer token. Fix: create a real PAT at <https://gitlab.com/-/user_settings/personal_access_tokens>, `export GITLAB_TOKEN=<pat>`, re-run. Or accept the skip warning and verify on push. Do not extract tokens from local config files. |
| `panic: runtime error: slice bounds out of range [:8] with length 4` (system failure in "Preparing environment") | Environment | run | The repo has no commits yet. glci falls back to `Ref = "main"` and gitlab-runner panics slicing the 4-char ref to 8. Confirm with `git rev-parse HEAD` (exits non-zero if no commits). Fix: `git add -A && git commit -m "Initial commit"`. `verify.sh` preflights for this and exits 2 with the same diagnosis before reaching gitlab-runner. lint and show are unaffected. |
| Cache cold every run | Environment | run | The cache key is too dynamic (changes every push) or paths don't match. Use `cache:key:files: [<lockfile>]` and check `cache:paths:` against where the package manager actually writes. |
| Job queues indefinitely on real GitLab | Environment | not-catchable-locally | The job's `tags:` do not match any runner. Either remove the `tags:` or register a runner with the matching tag. glci does not enforce tags. |

### Runtime errors (only run catches)

| Signature | Class | Catches at | Fix |
|---|---|---|---|
| `script exited with code N` (N ≠ 0) | Runtime | run | A command in the `script:` block failed. Look at the line above for which command. Apply the same fix you would for that command on your laptop. |
| `command not found: X` | Runtime | run | The image does not include the binary. Use a different image, or `apt-get install` / `apk add` in `before_script`. |
| `$VAR: parameter not set` (bash strict mode) or `$VAR` printed empty | Runtime | simulate | A variable referenced in the script was never set. Check CI/CD Variables, `variables:` block, or whether `--env` was passed when running locally. |
| Test failures (`X failed, Y passed`) | Runtime | run | Real test failure. The pipeline did its job. Investigate the test, not the CI config. |
| Out-of-memory (job killed, no clear log) | Runtime | run | Job exceeded the runner's memory limit. On shared runners this is hard to fix; consider reducing parallel test workers or moving to a self-hosted runner. |
| Network timeout (e.g., `npm install` hangs) | Runtime | run | Often transient. Add a `retry:` block to the job. If persistent, check the runner's outbound network. |
| Artifact upload too large | Runtime | run | GitLab.com has a default 1 GiB artifact limit. Narrow `artifacts:paths:` to what downstream jobs actually need. |

## Looked-like-X-but-was-Y confusions

These trip people up. State plainly which one it actually is.

- **"It worked locally with `glci run`, but failed on GitLab."** Usually a tag mismatch, a missing CI/CD Variable, or a server-only variable the job depends on. Compare the GitLab job log's environment dump against glci's. Tell the user: glci does not enforce tags or know about server-only variables (`CI_RUNNER_ID`, `CI_MERGE_REQUEST_ASSIGNEES`, etc.).
- **"Lint passes but the pipeline doesn't run."** `workflow:rules:` blocked it. Run `verify.sh show --context X` where X is the trigger the user expected.
- **"The job runs but `$MY_VAR` is empty."** Variable not in scope. Check protected/masked flag on the CI/CD Variable (protected variables only expose on protected branches), check `variables:` precedence (job > .glci.env > YAML > project > group; per glci's documented order).
- **"The pipeline passes simulate but fails run."** Always a runtime or environment problem (image, services, scripts, cache). simulate's job is to validate structure and artifact flow; it does not exercise scripts.
- **"`needs:` worked before, broke after a refactor."** A stage moved, or a job got renamed. `verify.sh show` reveals the new DAG; compare to the old one (if you snapshotted via `--json`).

## Classifying failures from `verify.sh run`

When a `verify.sh run` (or `verify.sh run --simulate`) finishes with one or more failed jobs, classify each failure before recommending next steps. Three categories cover the common cases. Apply the rules in order; the first match wins.

| Signal | Tag | What it means | Next move |
|---|---|---|---|
| Log contains `ERROR: Job exceeded the timeout limit of Xs` | `[local-timeout]` | The job hit glci's runner-side per-job timeout (default 1 hour). Could be a legitimately long job, or a faster-on-cloud job slowed by local resource contention. | Rerun the job in isolation: `scripts/verify.sh run <job> --reuse-artifacts --confirm-docker`. If it still hits the wall solo, raise the limit: `glci run <job> --timeout 2h`. If the job is legitimately long-running, add a YAML `timeout:` keyword so GitLab.com enforces the same higher value. |
| Exit code 137 or -9 (or "Killed" in the log without a clear cause) | `[oom]` | The job container was killed by the kernel for exceeding memory. Almost always local resource pressure under concurrent matrix execution. | Rerun the job in isolation with `--reuse-artifacts`. If it passes solo, the issue is local concurrency, not the code. Reduce concurrent jobs (`glci run -j 2`) or close other apps. Hosted runners have dedicated memory per job and won't hit this. |
| Anything else (script exit non-zero, test assertion failure, build error) | `[real]` | A genuine project failure. The script needs fixing. | Switch to Workflow 3 (Debug). Read the log, find the failing assertion or command, propose a code fix. |

**The summarization rule**: after a failed `verify.sh run`, the model's response must include a per-job classification line. Example:

```
✗ test [3.11]: [local-timeout] log: "Job exceeded the timeout limit of 3600s"; rerun solo with --reuse-artifacts
✗ test [3.12]: [local-timeout] same; consider raising with --timeout 2h
✗ docs: [oom] exit 137; rerun solo with `verify.sh run docs --reuse-artifacts --confirm-docker`
✗ style: [real] ruff exit 1; lint errors in src/foo.py:42
```

Without this classification, the user cannot distinguish "your matrix is too heavy for my laptop" from "your code is broken". With it, they can triage at a glance: `[local-timeout]` and `[oom]` usually mean "local environment, not the code"; `[real]` means "actually fix the code".

## Fix application cycle

For every fix proposed:

1. Apply the smallest change that addresses the diagnosed failure.
2. `scripts/verify.sh show` to confirm structure still validates.
3. If the failure was runtime (script error), `scripts/verify.sh run <job> --confirm-docker` (with `--reuse-artifacts` if upstream artifacts exist) to confirm the fix. If the failure was config (lint or show would have caught), the verify.sh result is sufficient.
4. Show `git diff` to the user and wait for approval before staging or pushing.

Do not propose a fix for a runtime error by modifying the YAML's structure. That's almost always the wrong layer.

## Local-only diagnosis when the user has no glci

If the user shares a failing pipeline URL or pasted log but cannot run glci locally:

- Diagnose from the log alone using the catalog above.
- Recommend a fix and run `scripts/verify.sh lint` (which can fall back to `glab ci lint`) to confirm the proposed YAML is syntactically valid.
- Tell the user explicitly: "I verified the fix lints clean. To confirm it actually works, you'll need to push and watch the pipeline, or install glci locally and re-run the job."

This is the honest framing: lint alone is necessary but not sufficient for runtime fixes.
