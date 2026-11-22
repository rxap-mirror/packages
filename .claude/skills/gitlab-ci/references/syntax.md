# GitLab CI syntax reference

Load this when generating or reviewing `.gitlab-ci.yml`. Curated keyword set: the keywords this skill produces, with a one-line definition each and a pointer to canonical docs. Not a clone of `docs.gitlab.com/ci/yaml/` (which has the full surface).

For any keyword not listed here, consult the canonical reference at https://docs.gitlab.com/ci/yaml/.

## At a glance

| Category | Keywords |
|---|---|
| Global | `stages`, `variables`, `default`, `include`, `workflow` |
| Job (essential) | `script`, `stage`, `image`, `rules`, `needs`, `artifacts`, `cache` |
| Job (common) | `before_script`, `after_script`, `variables`, `tags`, `extends`, `services` |
| Job (parallelism) | `parallel`, `parallel:matrix` |
| Job (control) | `when`, `allow_failure`, `interruptible`, `retry`, `timeout` |
| Job (lifecycle) | `environment`, `resource_group`, `trigger`, `release` |
| Reuse | `!reference`, hidden jobs (`.name`), `extends` |
| Pipeline header | `spec:inputs` (for reusable pipelines via `include:`) |

## Global keywords

### `stages`

Defines pipeline stages and their order. Jobs without `stage:` default to `test`. If `stages:` is omitted, GitLab uses `[.pre, build, test, deploy, .post]`.

```yaml
stages:
  - build
  - test
  - deploy
```

Docs: https://docs.gitlab.com/ci/yaml/#stages.

### `variables`

Pipeline-wide variables. Available in every job.

```yaml
variables:
  NODE_VERSION: "20"
  CI_DEBUG_TRACE: "false"
```

Docs: https://docs.gitlab.com/ci/yaml/#variables.

### `default`

Default values applied to every job. Idiomatic place for shared `image:`, `before_script:`, `tags:`, `interruptible:`, etc.

```yaml
default:
  image: node:lts-alpine
  interruptible: true
  before_script:
    - npm ci --cache .npm --prefer-offline
```

Docs: https://docs.gitlab.com/ci/yaml/#default.

### `include`

Pulls in YAML from another source. Components, project files, remote URLs, templates.

```yaml
include:
  - component: gitlab.com/components/opentofu/full-pipeline@1.0.0
    inputs:
      version: 1.8.0
  - local: '/.gitlab/ci/security.yml'
  - template: 'Jobs/SAST.gitlab-ci.yml'
```

Always pin components to a release tag, never `~latest`. Docs: https://docs.gitlab.com/ci/yaml/#include.

### `workflow`

Controls whether the pipeline runs at all. Use `workflow:rules:` to gate on branch, tag, MR, or schedule.

```yaml
workflow:
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
    - if: $CI_COMMIT_TAG
```

Docs: https://docs.gitlab.com/ci/yaml/#workflow.

## Essential job keywords

### `script`

The shell commands the job runs. Each item is one shell invocation.

```yaml
test:
  script:
    - npm test
```

Docs: https://docs.gitlab.com/ci/yaml/#script.

### `stage`

The stage this job belongs to. Must exist in `stages:`.

```yaml
test:
  stage: test
  script: [npm test]
```

### `image`

The container image the job runs in.

```yaml
test:
  image: node:20-alpine
  script: [npm test]
```

Use `default:image:` if most jobs share an image. Docs: https://docs.gitlab.com/ci/yaml/#image.

### `rules`

When the job runs. Replaces deprecated `only:` and `except:`.

```yaml
deploy:
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: on_success
    - when: never
```

Docs: https://docs.gitlab.com/ci/yaml/#rules.

### `needs`

Declares per-job dependencies, enabling DAG execution (skip stage boundaries).

```yaml
package:
  stage: deploy
  needs: ["build", "test"]
```

Docs: https://docs.gitlab.com/ci/yaml/#needs.

### `artifacts`

Files produced by the job and passed to later jobs.

```yaml
build:
  artifacts:
    paths:
      - dist/
    expire_in: 1 week
```

Docs: https://docs.gitlab.com/ci/yaml/#artifacts.

### `cache`

Files cached across pipelines (e.g. `node_modules/`, `.cargo/registry/`). See `references/caching.md` for cache-key patterns.

```yaml
test:
  cache:
    key:
      files: [package-lock.json]
    paths:
      - node_modules/
```

Docs: https://docs.gitlab.com/ci/yaml/#cache.

## Common job keywords

### `before_script`, `after_script`

Setup and teardown. Use `default:before_script:` for shared setup.

### `variables` (job-level)

Per-job variables. Override pipeline-level `variables`.

### `tags`

Select runners by label. Most users on gitlab.com leave this empty (shared runners). Use only when the user has registered custom runners.

### `extends`

Inherit from another job. The idiomatic GitLab reuse pattern, paired with hidden jobs.

```yaml
.docker-job:
  image: docker:24
  services:
    - docker:24-dind

build-image:
  extends: .docker-job
  stage: build
  script: [docker build -t $CI_REGISTRY_IMAGE .]
```

Docs: https://docs.gitlab.com/ci/yaml/#extends.

### `services`

Sidecar containers (databases, dind, redis). Run alongside the job container.

```yaml
test:
  services:
    - postgres:16
  variables:
    POSTGRES_DB: test
```

Docs: https://docs.gitlab.com/ci/yaml/#services.

## Parallelism

### `parallel`

Run N copies of a job. Each gets `$CI_NODE_INDEX` (1-based).

```yaml
test:
  parallel: 5
  script: [./test --shard $CI_NODE_INDEX/$CI_NODE_TOTAL]
```

### `parallel:matrix`

Run a job per variable combination.

```yaml
test:
  parallel:
    matrix:
      - NODE_VERSION: ["18", "20", "22"]
        OS: [linux, alpine]
```

Docs: https://docs.gitlab.com/ci/yaml/#parallel.

## Reuse patterns

### Hidden jobs

A job whose name starts with `.` is hidden: it does not run, but can be `extends:`-ed. The idiomatic place to define reusable job templates.

```yaml
.test-base:
  stage: test
  cache:
    key:
      files: [package-lock.json]
    paths: [node_modules/]

unit-test:
  extends: .test-base
  script: [npm test]

integration-test:
  extends: .test-base
  script: [npm run test:integration]
```

### `!reference`

Reuse a specific block from another job or list. Avoids the all-or-nothing nature of `extends:`.

```yaml
.shared-rules:
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

deploy:
  rules:
    - !reference [.shared-rules, rules]
    - if: $CI_COMMIT_TAG
```

Docs: https://docs.gitlab.com/ci/yaml/yaml_optimization/#reference-tags.

## Common predefined variables

When you write `.gitlab-ci.yml` for a user, these are the predefined variables your script: blocks will most often reference. Full list: https://docs.gitlab.com/ci/variables/predefined_variables/.

| Variable | What it is |
|---|---|
| `$CI_COMMIT_BRANCH` | The branch name; empty for tag and MR pipelines |
| `$CI_COMMIT_TAG` | The tag name; empty otherwise |
| `$CI_COMMIT_REF_SLUG` | The branch or tag, slugified, useful for cache keys |
| `$CI_DEFAULT_BRANCH` | Usually `main` |
| `$CI_PIPELINE_SOURCE` | `push`, `merge_request_event`, `schedule`, `web`, `api`, `trigger`, `pipeline` |
| `$CI_PROJECT_DIR` | The checkout directory |
| `$CI_PROJECT_PATH` | `group/project` |
| `$CI_REGISTRY` | The project's container registry host |
| `$CI_REGISTRY_IMAGE` | The image base path for `$CI_REGISTRY` |
| `$CI_REGISTRY_USER`, `$CI_REGISTRY_PASSWORD` | Auth for `$CI_REGISTRY` |
| `$CI_JOB_NAME`, `$CI_JOB_STAGE` | The current job and stage |
| `$CI_COMMIT_SHA` | Full SHA of the commit being built |

## Things to avoid

- `only:` and `except:` (deprecated; use `rules:`).
- YAML anchors (`&` and `*`) for reuse (use `extends:` and `!reference:`).
- `~latest` as a component version pin (always pin to a release tag).
- Quoting numeric variable values inconsistently (always quote in `parallel:matrix:` to avoid YAML int coercion).
- Hardcoded secrets (always use **Settings > CI/CD > Variables**).
- `image:` per job when the same image is used everywhere (use `default:image:`).
