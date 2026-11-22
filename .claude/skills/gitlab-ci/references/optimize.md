# Optimize reference

Workflow 4 flow plus the per-pattern playbook. Load when the user has a working pipeline and asks for it faster, cheaper, or more parallel. Apply one pattern per round. Always identify a structural reason before proposing a change.

## Workflow 4 flow

### 4.1 Snapshot the current pipeline

Run `scripts/verify.sh show -f <file>` and **paste the output verbatim as a fenced code block in your response message text** (not the Bash tool output, which auto-collapses) as the "before" snapshot. Also capture the structured form for diffing:

```
scripts/verify.sh show -f <file> --json > /tmp/pipeline-before.json
```

The JSON includes stages, jobs, when, image, and needs. The ASCII graph is what the user sees; the JSON is for the agent to diff later.

### 4.2 Identify bottlenecks

Read the existing `.gitlab-ci.yml` and check the patterns in this file (below). Pick one pattern per round; do not propose every optimization at once.

### 4.3 Propose the change

Output as a diff against the current YAML. Explain in one line why it helps (concrete reason, e.g., "this lets test and lint run concurrently; currently they wait for stage ordering"). Wait for confirmation.

### 4.4 Show the optimized pipeline

After applying the change, run `scripts/verify.sh show` again and **paste the output verbatim as a fenced code block in your response message text** as the "after" snapshot, directly below the "before". (Same rule as before: tool output alone auto-collapses; the graph must live in the message body.) The user sees the DAG diff visually without reading JSON.

If the change touched `needs:`, `artifacts:`, or stage placement, also run `scripts/verify.sh simulate`. Simulate exercises the planner's artifact passing without running real scripts; it catches "I broke the DAG" mistakes.

### 4.5 Measure (optional, opt-in)

If the user wants real numbers:

```
scripts/verify.sh show -f <file> --json > /tmp/pipeline-after.json
diff /tmp/pipeline-before.json /tmp/pipeline-after.json
```

For runtime measurement, run the pipeline locally before and after the change (`scripts/verify.sh run --confirm-docker`) and compare via `glci history show` and `glci artifacts diff <pipeline-a> <pipeline-b> --job <name>`.

Ask for commit approval per principle 5.

## Snapshot first, propose second

Before any change, capture the current pipeline graph:

```
scripts/verify.sh show --json > /tmp/pipeline-before.json
```

Re-snapshot after the change and `diff` the two JSON files to surface real changes versus cosmetic ones. For runtime measurement, run the pipeline locally before and after (`scripts/verify.sh run --confirm-docker`) and compare via `glci history show` and `glci artifacts diff <pipeline-a> <pipeline-b> --job <name>`.

Do not claim a performance win without measuring. "This should be faster" is a hypothesis, not a result.

## Pattern 1: Serial-to-DAG via `needs:`

**Detection**: jobs in different stages that have no real dependency between them. Stage ordering forces them to wait for the prior stage to finish.

**Example**:

```yaml
# Before: lint waits for build to finish, but it doesn't need the build output
build:
  stage: build
  script: [make build]
lint:
  stage: test
  script: [npm run lint]
test:
  stage: test
  script: [npm test]
```

```yaml
# After: lint starts immediately; test still depends on build's artifacts
build:
  stage: build
  script: [make build]
  artifacts: { paths: [dist/] }
lint:
  stage: test
  needs: []                    # no upstream dependency
  script: [npm run lint]
test:
  stage: test
  needs: [{ job: build, artifacts: true }]
  script: [npm test]
```

**Verify with**: `simulate`. Simulate's planner exercises the DAG and surfaces broken artifact flow without running real scripts.

**When not to apply**: if the stage-ordering wait is intentional (e.g., a deploy stage that should never start before all tests pass), leave it alone. DAG is for jobs that genuinely don't depend on each other.

## Pattern 2: Lockfile-keyed cache

**Detection**: `cache:` block missing, or `cache:key:` uses only `$CI_COMMIT_REF_SLUG` (per-branch but not lockfile-aware). The symptom: cache rebuilt on every push, even when dependencies didn't change.

**Example** (Node):

```yaml
# Before (cache rebuilt every push to main):
cache:
  key: $CI_COMMIT_REF_SLUG
  paths: [node_modules/]
```

```yaml
# After (cache invalidated only when package-lock.json changes):
cache:
  key:
    files: [package-lock.json]
  paths: [node_modules/]
```

Per-language lockfile and paths:

| Stack | `files:` | `paths:` |
|---|---|---|
| Node (npm) | `[package-lock.json]` | `[node_modules/]` |
| Node (yarn) | `[yarn.lock]` | `[node_modules/, .yarn/cache/]` |
| Node (pnpm) | `[pnpm-lock.yaml]` | `[.pnpm-store/]` |
| Python (pip) | `[requirements.txt]` | `[.cache/pip/]` |
| Python (uv) | `[uv.lock]` | `[.cache/uv/]` |
| Python (poetry) | `[poetry.lock]` | `[.cache/pypoetry/]` |
| Go | `[go.sum]` | `[.cache/go-build/]` |
| Ruby (bundler) | `[Gemfile.lock]` | `[vendor/bundle/]` |
| Rust (cargo) | `[Cargo.lock]` | `[.cargo/, target/]` |

**Verify with**: `run`. Cache effectiveness only shows up when the same job runs twice; observe whether the second run uses the cache (the log says "Restoring cache" with the same key).

## Pattern 3: Narrow artifacts to what's needed

**Detection**: a job uploads a large directory and downstream jobs only consume one subdirectory. Wide artifact paths cost upload time, storage, and download time.

**Example**:

```yaml
# Before (uploads everything):
build:
  artifacts:
    paths: ["./"]
```

```yaml
# After (only the build output):
build:
  artifacts:
    paths: [dist/, public/]
    expire_in: 1 week
```

`expire_in: 1 week` (or shorter) prevents the artifact from accumulating indefinitely. Default is 30 days on GitLab.com.

**Verify with**: `show` and then `run`. Show reveals the new artifact spec; run reveals the actual upload size in the log (`Uploading artifacts as "archive"`).

## Pattern 4: `parallel:matrix:` for cross-version testing

**Detection**: same job repeated across Python or Node versions via copy-paste:

```yaml
test-py-3.10:
  image: python:3.10
  script: [pytest]
test-py-3.11:
  image: python:3.11
  script: [pytest]
test-py-3.12:
  image: python:3.12
  script: [pytest]
```

**Fix**:

```yaml
test:
  image: python:${PY}
  parallel:
    matrix:
      - PY: ["3.10", "3.11", "3.12"]
  script: [pytest]
```

GitLab's UI groups parallel-matrix jobs and surfaces them as a single test job with three variants. Runners can pick them up in parallel without additional config.

**Verify with**: `show`. The graph reveals all expanded jobs (`test [3.10]`, `test [3.11]`, `test [3.12]`). Confirm the count matches what you intended.

## Pattern 5: `interruptible: true`

**Detection**: pushing a fixup commit to a branch with a pipeline already running spawns a second pipeline; the first keeps running and burns minutes. The same for force-pushes to MR branches.

**Fix** (apply at the `default:` block to opt all jobs in):

```yaml
default:
  interruptible: true
```

When a new pipeline starts for the same ref, GitLab cancels the in-flight one. Jobs with side effects (deployments) should override with `interruptible: false`.

**Verify with**: requires a real GitLab pipeline (glci has no concept of "newer pipeline for the same ref"). Manual: push twice in quick succession and confirm GitLab cancels the first.

## Pattern 6: Pin images to specific tags

**Detection**: `image: node` (no tag) or `image: node:lts` (rolling tag). The pipeline behavior changes silently when the upstream image moves.

**Fix**:

```yaml
# Before:
image: node:lts

# After (pinned to a specific minor + distro):
image: node:22.11-bookworm-slim

# Or (immutable, pinned to a digest):
image: node@sha256:abc123...
```

For the strictest reproducibility, pin to a digest. For practical reproducibility (security patches still flow), pin to a specific tag matched to the distro.

**Verify with**: `run`. Run once and confirm the image pulls cleanly; you can also confirm `docker images` shows the pinned tag.

## Pattern 7: Cache `key:files:` vs per-branch keys

**Detection**: cache works but is stack-aware enough to be useful, but multiple branches with the same dependencies fight over the cache.

**Pattern A** (single cache per lockfile, shared across branches):

```yaml
cache:
  key:
    files: [package-lock.json]
  paths: [node_modules/]
```

This shares the cache across branches whenever the lockfile is the same. Pros: maximum reuse. Cons: a different branch with the same lockfile can poison the cache if it writes weird files.

**Pattern B** (per-branch, lockfile-keyed):

```yaml
cache:
  key:
    prefix: $CI_COMMIT_REF_SLUG
    files: [package-lock.json]
  paths: [node_modules/]
```

Each branch has its own cache; the lockfile invalidates within a branch. Pros: isolation. Cons: cold cache on first push of every new branch.

Pick A for projects with stable lockfiles, B for projects with frequent feature branches.

**Verify with**: `run`. Run on two branches with the same lockfile to confirm cache behavior matches expectation.

## Pattern 8: Drop redundant `before_script`

**Detection**: every job has the same `before_script`, repeated. The `default:` block exists to host shared setup once.

**Fix**:

```yaml
# Before (duplicated):
build:
  before_script: [npm ci]
  script: [npm run build]
test:
  before_script: [npm ci]
  script: [npm test]
```

```yaml
# After (one place):
default:
  before_script: [npm ci]

build:
  script: [npm run build]
test:
  script: [npm test]
```

Jobs that need a different `before_script` can still override per-job; the default only applies where there's no override.

**Verify with**: `show --json` before and after. Job count and execution order should be unchanged; the YAML is shorter.

## Anti-patterns to refuse

- **Removing `needs:` to "simplify" the pipeline**: this gives up DAG parallelism. Refuse unless the user explicitly says they want serial execution.
- **Dropping `interruptible:` to "be safe"**: leaving an in-flight pipeline running to completion when a newer commit has superseded it wastes runner time. The right answer is `interruptible: true` plus per-job `interruptible: false` for genuine side-effect jobs.
- **Tightening `rules:` without a reason**: don't propose narrowing `rules:` for "performance"; rules don't affect job runtime, only whether the job runs at all.
- **Switching cache to no-key (`cache: { paths: [...] }`)**: that produces one cache shared by every branch and every ref, which usually corrupts. Always provide a key.

## Measuring the win

Before claiming an optimization worked:

1. `scripts/verify.sh show --json` before and after, diffed.
2. For runtime impact: `scripts/verify.sh run --confirm-docker` before and after, with `glci history show` capturing wall-clock per job.
3. Report the actual numbers: "build went from 2:45 to 1:30; test from 3:10 to 2:50 (now starts in parallel with lint)." Do not report relative percentages without absolute numbers.

If measurement is impractical (the user is iterating quickly), say so: "I applied the pattern; I haven't measured the runtime impact. If you want a number, run before and after with `glci run --confirm-docker`."
