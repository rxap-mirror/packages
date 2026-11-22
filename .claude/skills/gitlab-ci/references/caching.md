# Caching reference

Load this when configuring `cache:` in a job or in `default:`. Cache reduces pipeline time by avoiding re-fetch and re-build of dependencies between pipelines.

## Contents

- What cache is, and what it is not
- Cache key patterns (lock-file hash, per-branch, per-job, fallback keys)
- Cache paths (per stack)
- Cache policy (pull-push, pull, push)
- Multiple caches per job
- When cache is wrong
- Cache and `default:`
- Verifying cache hits

## What cache is, and what it is not

Cache is **for dependencies**: `node_modules/`, `.cargo/registry/`, `vendor/`, `.cache/pip/`. It is shared between pipelines on the same key.

Artifacts are **for pipeline outputs**: build products, test reports, generated files. They flow between jobs in the same pipeline.

Do not put pipeline outputs in cache. Do not put dependencies in artifacts.

## Cache key patterns

Use the right key for the right scope. Wrong key means stale cache (slow) or thrashing cache (no benefit).

### Lock-file hash (recommended for most cases)

```yaml
cache:
  key:
    files:
      - package-lock.json
  paths:
    - node_modules/
```

The key changes only when the lock file changes. Most jobs share the same cache across pipelines.

Equivalents per stack:

| Stack | Lock file |
|---|---|
| Node.js | `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml` |
| Python | `poetry.lock`, `Pipfile.lock`, `requirements.txt` (acceptable as a coarse key) |
| Go | `go.sum` |
| Ruby | `Gemfile.lock` |
| Rust | `Cargo.lock` |

### Per-branch

```yaml
cache:
  key: $CI_COMMIT_REF_SLUG
  paths: [node_modules/]
```

Each branch gets its own cache. Good when branches diverge in dependencies. Slow on first run of a new branch.

### Per-job

```yaml
cache:
  key: $CI_JOB_NAME-$CI_COMMIT_REF_SLUG
  paths: [.cache/]
```

When different jobs in the same branch need disjoint cache. Rarely the right answer; prefer one cache shared via `default:cache:`.

### Fallback keys

```yaml
cache:
  key:
    files: [package-lock.json]
  fallback_keys:
    - $CI_DEFAULT_BRANCH
  paths: [node_modules/]
```

If the lock-file key has no cache, fall back to the default branch's cache. Reduces cold-start time on new branches.

## Cache paths

List directories explicitly. Globs work but are slower to resolve.

| Stack | Cache paths |
|---|---|
| Node.js (npm) | `.npm/` (the registry cache; pair with `npm ci --cache .npm --prefer-offline`) |
| Node.js (yarn) | `.yarn/cache/` |
| Node.js (pnpm) | `.pnpm-store/` |
| Python (pip) | `.cache/pip/` |
| Python (poetry) | `.cache/pypoetry/` |
| Go | `.go/pkg/mod/` (with `GOPATH=$CI_PROJECT_DIR/.go`) |
| Ruby (bundler) | `vendor/ruby/` (with `bundle config set --local deployment true`) |
| Rust (cargo) | `.cargo/registry/cache/`, `target/` (with `CARGO_HOME=$CI_PROJECT_DIR/.cargo`) |

For environments where the home directory is not under `$CI_PROJECT_DIR`, set the tool-specific home variable so the cache lives inside the project directory (otherwise it is outside the cached path and lost between jobs).

## Cache policy

By default, jobs both pull and push the cache. Override when you want different behavior:

- `policy: pull-push` (default): pull at start, push at end.
- `policy: pull`: read-only. Use when the job consumes the cache but does not change it (test jobs that do not install dependencies).
- `policy: push`: write-only. Use when the job populates the cache for downstream jobs (a dedicated "warm cache" job).

```yaml
.cache-base:
  cache:
    key:
      files: [package-lock.json]
    paths: [node_modules/]

warm-cache:
  extends: .cache-base
  stage: .pre
  cache:
    policy: pull-push
  script:
    - npm ci

test:
  extends: .cache-base
  cache:
    policy: pull
  script:
    - npm test
```

## Multiple caches per job

A job can declare a list of caches:

```yaml
test:
  cache:
    - key:
        files: [package-lock.json]
      paths: [.npm/]
    - key: $CI_COMMIT_REF_SLUG-build
      paths: [.cache/build-output/]
```

Use this when a job needs caches with different keys (e.g., one keyed on a lock file, another keyed per branch). Rare. Prefer one cache shared via `default:cache:` unless there is a concrete reason.

## When cache is wrong

- Build outputs that change every commit: use artifacts.
- Anything secret: never put credentials in cache.
- Large directories that change every run: cache costs upload + download every job; if the directory changes more than it stays the same, skip cache and accept the cold start.

## Cache and `default:`

If most jobs share one cache configuration, define it once in `default:`:

```yaml
default:
  cache:
    key:
      files: [package-lock.json]
    paths: [node_modules/, .npm/]
```

A job can still override `cache:` to declare its own configuration or `cache: []` to disable.

## Verifying cache hits

The job log shows whether cache was extracted: look for `Restoring cache` and `Successfully extracted cache`. If you see `Created cache <key>` followed by `Cache miss` on the next pipeline run, the key is changing unnecessarily; check that you are not hashing files that change every commit.
