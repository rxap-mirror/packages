# Starter pipeline recipes

Load this when generating an initial `.gitlab-ci.yml` for a user. Every recipe follows GitLab's canonical shape: `build`, `test`, `deploy` (deploy as a stub if no target is set up). All recipes use `default:` for shared fields, hidden jobs + `extends:` for reuse, and pin component versions.

## Contents

- Detection signals (how to pick a recipe)
- Local validation and matrix breadth
- Recipe: Node.js with Jest (or test runner of choice)
- Recipe: Python with pytest
- Recipe: Go
- Recipe: Ruby with RSpec
- Recipe: Rust with cargo test
- Recipe: Docker image build and push
- When the user has a deploy target

## Detection signals

Read these files to pick the recipe. Detection happens first; ask the user only if the signals are ambiguous.

| Signal file | Stack |
|---|---|
| `package.json` (no TypeScript indicator) | Node.js |
| `package.json` + `tsconfig.json` | TypeScript on Node.js |
| `pyproject.toml`, `setup.py`, `requirements.txt` | Python |
| `go.mod` | Go |
| `Gemfile` | Ruby |
| `Cargo.toml` | Rust |
| `Dockerfile` (no other strong signal) | Docker image build |
| `pom.xml`, `build.gradle` | Java (not covered in v1) |
| `*.csproj` | .NET (not covered in v1) |

When multiple signals exist, pick the dominant one and confirm with the user before generating.

## Local validation and matrix breadth

Recipes below may suggest `parallel:matrix` (Python versions, Node versions, Go versions, Ruby versions, Rust toolchains, platform variants). On GitLab.com runners this is free: jobs fan out in parallel across dedicated runners. On a developer laptop, each matrix entry spawns its own Docker container and shares the host's CPU, memory, image-pull bandwidth, and disk.

**Recommendation when generating a starter pipeline**: pin the matrix to 1 or 2 entries in the YAML committed to the repo. The user's local `verify.sh run` then completes in a few minutes instead of saturating their laptop. When the user pushes to GitLab.com, the same YAML runs on hosted runners with the full matrix expansion they want.

The skill should:

- For initial pipeline generation (Workflow 1): default to a single matrix entry (e.g., the highest-version Python only). Mention that adding more entries is a one-line change once they're confident.
- For optimization (Workflow 4): if the user wants the full matrix, suggest gating it behind `rules: - if: '$CI_PIPELINE_SOURCE == "schedule"'` so daily scheduled pipelines exercise the full matrix while every-push pipelines stay fast.
- For local verification: if the YAML committed has a wide matrix, suggest running `glci run <one-matrix-entry> --reuse-artifacts --confirm-docker` instead of the full pipeline.

## Recipe: Node.js with Jest (or test runner of choice)

Detected by `package.json` with a `test` script. Pick the Node version from `engines.node` in `package.json` if present; default to `lts-alpine`.

```yaml
default:
  image: node:lts-alpine
  interruptible: true
  cache:
    key:
      files: [package-lock.json]
    paths: [.npm/]
  before_script:
    - npm ci --cache .npm --prefer-offline

stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths: [dist/]
    expire_in: 1 week

lint:
  stage: test
  script: [npm run lint]
  needs: []

unit-test:
  stage: test
  script: [npm test]
  needs: []

deploy:
  stage: deploy
  script:
    - echo "Configure your deploy target. See docs.gitlab.com/ci/environments/"
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
      allow_failure: true
```

Rationale: `default:` covers `image`, `cache`, and `before_script` (most jobs need `npm ci`). `unit-test` and `lint` declare `needs: []` so they start as soon as the pipeline begins, in parallel with `build`. `deploy` is manual and gated to the default branch.

### Variant: no committed lockfile

Some Node projects gitignore `package-lock.json`. This is common for libraries published to npm; older packages may also predate the lockfile convention. When the project has no committed lockfile, adapt two parts of the recipe:

- **Cache key**: use `package.json` instead of `package-lock.json`. Cache invalidates whenever `package.json` changes (a coarser signal than the lockfile, acceptable for projects without one).
- **Install command**: `npm install` instead of `npm ci`. `npm ci` requires a tracked lockfile and exits non-zero if one is missing.

```yaml
default:
  cache:
    key:
      files: [package.json]
    paths: [.npm/]
  before_script:
    - npm install --cache .npm --prefer-offline --no-audit --no-fund
```

`--no-audit` and `--no-fund` shave seconds off each install. Useful in CI; harmless locally.

### Variant: no build script (runtime-only library)

Some packages have no `npm run build` script: pure-JS libraries, runtime utilities, anything that publishes its source directly. Two reasonable shapes for the build stage:

**`npm pack`** (recommended for npm-published libraries): produces the publishable `.tgz` as an artifact. Real build output; a downstream `publish` job consumes it.

```yaml
build:
  stage: build
  script:
    - npm pack
  artifacts:
    paths: ["*.tgz"]
    expire_in: 1 week
```

**Omit the build stage entirely**: only `test` and `deploy`. Use when there is genuinely nothing to build (e.g., a runtime CLI that ships its source verbatim with no packaging step). Update `stages:` accordingly.

For these projects the `deploy` job is usually `npm publish`, gated on `$CI_COMMIT_TAG`, with `NPM_TOKEN` set as a masked, protected CI/CD variable.

## Recipe: Python with pytest

Detected by `pyproject.toml`, `setup.py`, or `requirements.txt`. Pick the Python version from `pyproject.toml` if pinned, else `python:3.12-slim`. Use pip cache.

```yaml
default:
  image: python:3.12-slim
  interruptible: true
  cache:
    key:
      files: [pyproject.toml, requirements.txt]
    paths: [.cache/pip/]
  before_script:
    - python -m venv venv
    - source venv/bin/activate
    - pip install --cache-dir .cache/pip -e ".[test]"

stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - python -m build
  artifacts:
    paths: [dist/]
    expire_in: 1 week
  rules:
    - if: $CI_COMMIT_TAG
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

lint:
  stage: test
  script:
    - pip install ruff
    - ruff check .
  needs: []

test:
  stage: test
  script:
    - pytest --junitxml=report.xml
  artifacts:
    reports:
      junit: report.xml
  needs: []

deploy:
  stage: deploy
  script:
    - echo "Configure your deploy target. See docs.gitlab.com/ci/environments/"
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
      allow_failure: true
```

Rationale: pip cache keyed on dependency files; `artifacts:reports:junit:` puts test results into GitLab's UI test-report view; `build` runs only on the default branch and tags to avoid wasting CI time on feature branches.

## Recipe: Go

Detected by `go.mod`. Use `golang:1.23-alpine` (or the latest stable). Cache the module download.

```yaml
default:
  image: golang:1.23-alpine
  interruptible: true
  variables:
    GOPATH: $CI_PROJECT_DIR/.go
  cache:
    key:
      files: [go.sum]
    paths:
      - .go/pkg/mod/
  before_script:
    - mkdir -p .go
    - go mod download

stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - go build -o app ./...
  artifacts:
    paths: [app]
    expire_in: 1 week

lint:
  stage: test
  image: golangci/golangci-lint:latest-alpine
  script: [golangci-lint run]
  needs: []

test:
  stage: test
  script:
    - go test -race -coverprofile=coverage.out ./...
  needs: []
  coverage: '/coverage: \d+\.\d+% of statements/'
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: coverage.xml

deploy:
  stage: deploy
  script:
    - echo "Configure your deploy target."
  needs: [build]
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
      allow_failure: true
```

Rationale: `GOPATH` under `$CI_PROJECT_DIR/.go` keeps the cache portable. `lint` uses a different image (`golangci-lint`); job-level `image:` overrides `default:image:`.

## Recipe: Ruby with RSpec

Detected by `Gemfile`. Use the Ruby version from `.ruby-version` if present, else `ruby:3.3-alpine`.

```yaml
default:
  image: ruby:3.3-alpine
  interruptible: true
  cache:
    key:
      files: [Gemfile.lock]
    paths: [vendor/ruby/]
  before_script:
    - apk add --no-cache build-base
    - bundle config set --local deployment true
    - bundle install --jobs $(nproc) --path vendor

stages:
  - build
  - test
  - deploy

build:
  stage: build
  script:
    - bundle exec rake build
  artifacts:
    paths: [pkg/]
    expire_in: 1 week

rubocop:
  stage: test
  script: [bundle exec rubocop]
  needs: []

rspec:
  stage: test
  script: [bundle exec rspec]
  needs: []
  artifacts:
    reports:
      junit: tmp/rspec.xml

deploy:
  stage: deploy
  script:
    - echo "Configure your deploy target."
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
      allow_failure: true
```

## Recipe: Rust with cargo test

Detected by `Cargo.toml`. Use `rust:1-alpine` or the latest stable.

```yaml
default:
  image: rust:1-alpine
  interruptible: true
  variables:
    CARGO_HOME: $CI_PROJECT_DIR/.cargo
  cache:
    key:
      files: [Cargo.lock]
    paths:
      - .cargo/registry/cache/
      - target/
  before_script:
    - apk add --no-cache musl-dev

stages:
  - build
  - test
  - deploy

build:
  stage: build
  script: [cargo build --release]
  artifacts:
    paths: [target/release/]
    expire_in: 1 week

clippy:
  stage: test
  script:
    - rustup component add clippy
    - cargo clippy -- -D warnings
  needs: []

test:
  stage: test
  script: [cargo test]
  needs: []

deploy:
  stage: deploy
  script:
    - echo "Configure your deploy target."
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
      allow_failure: true
```

## Recipe: Docker image build and push

Detected by `Dockerfile` at repo root (and no other dominant stack signal). Push to GitLab's built-in container registry.

```yaml
default:
  interruptible: true

stages:
  - build
  - test
  - deploy

build:
  stage: build
  image: docker:24
  services:
    - docker:24-dind
  variables:
    DOCKER_HOST: tcp://docker:2375
    DOCKER_TLS_CERTDIR: ""
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -t $CI_REGISTRY_IMAGE:latest .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
    - if: $CI_COMMIT_TAG

hadolint:
  stage: test
  image: hadolint/hadolint:latest-alpine
  script: [hadolint Dockerfile]
  needs: []

deploy:
  stage: deploy
  script:
    - echo "Configure your deploy target."
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
      allow_failure: true
```

Rationale: uses GitLab's predefined registry variables (`$CI_REGISTRY`, `$CI_REGISTRY_IMAGE`, `$CI_REGISTRY_USER`, `$CI_REGISTRY_PASSWORD`) so no manual variable setup is needed; tags both the SHA and `latest`; gates pushes to the default branch and tags.

For builds that fit a Catalog component (multi-arch, BuildKit, signing), look up `references/catalog.md` first.

## When the user has a deploy target

The recipes above stub `deploy:` because the deploy target is not detectable from repo files. When the user tells you their target, replace the stub:

- **Kubernetes**: `kubectl apply` with image substitution via `envsubst` or `sed`; or a Catalog component (e.g., Auto Deploy).
- **Static site (GitLab Pages)**: rename the deploy job to `pages` and produce `public/` as the artifact.
- **Container deployment (Cloud Run, Fargate, etc.)**: cloud-CLI invocation; consider whether a Catalog component exists.
- **Package registries (npm, PyPI, RubyGems)**: language-specific `*publish*` invocation gated to `if: $CI_COMMIT_TAG`.

Each of these warrants a follow-up conversation with the user. Do not guess the deploy mechanism.
