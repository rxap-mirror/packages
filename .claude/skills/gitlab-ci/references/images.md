# Picking the right image

Load this when generating or reviewing the `image:` field on a job. Pick an image that matches the user's runtime, is small enough to pull fast, and is widely available on GitLab.com's shared runners.

## Defaults by stack

| Stack | Default image | Why |
|---|---|---|
| Node.js | `node:lts-alpine` | Long-term support, Alpine for size. Use specific major (`node:20-alpine`) when the user pins via `engines.node` |
| Python | `python:3.12-slim` | Debian slim is the standard; pyenv-style versioning is well supported |
| Go | `golang:1.23-alpine` | Static binary builds work cleanly in Alpine |
| Ruby | `ruby:3.3-alpine` | Match the user's `.ruby-version` if present |
| Rust | `rust:1-alpine` | musl target works for static binaries; switch to `rust:1` (Debian) if the build needs glibc |
| Docker build | `docker:24` + `services: docker:24-dind` | DinD pattern. See recipes.md |
| Java | `eclipse-temurin:21-jdk` | Free-to-distribute OpenJDK build |
| .NET | `mcr.microsoft.com/dotnet/sdk:8.0` | Microsoft's official image |
| Generic shell | `alpine:3.20` | When all you need is a shell and basic tools |

Put `image:` in `default:` if most jobs use the same image. Override `image:` per job only when the job needs a different tool (linter image, registry image, dind, etc.).

## Choosing between Alpine and Debian variants

Alpine images are 5 to 10 times smaller than their Debian counterparts and pull faster, but use musl libc rather than glibc. Quirks to keep in mind:

- Native modules built for glibc (some Node.js, Python wheels) may fail on Alpine. If `npm install` or `pip install` fails with a linker error, switch to the Debian variant.
- Alpine uses `apk` for packages, not `apt`. Adjust `before_script:` accordingly.
- Some images do not have an Alpine variant (e.g., `mcr.microsoft.com/dotnet/sdk`).

Default to Alpine; switch to the Debian/slim variant on the first sign of a native-module failure.

## Pinning image versions

Prefer concrete major or minor tags over `latest`:

- Good: `node:20-alpine`, `python:3.12-slim`, `golang:1.23-alpine`.
- Bad: `node`, `python`, `golang`, `*:latest`.

Concrete tags survive upstream churn; `latest` does not. The exception is `docker:24` for DinD, which conventionally tracks the major.

## Multi-platform builds

When the user needs to build for multiple architectures (typically `linux/amd64` and `linux/arm64`):

- Use a Catalog component if one exists (see `references/catalog.md`).
- For Docker images, use `docker buildx` with QEMU. Add `services: docker:24-dind` and pre-register binfmt with `docker run --rm --privileged tonistiigi/binfmt --install all` in `before_script:`.
- Multi-platform builds work on GitLab.com shared runners but the `docker:24-dind` service consumes more pipeline minutes than a single-arch build. Mention this to the user.

## Language version detection signals

Pick the version from the user's repo when it is pinned:

| Stack | File | Field |
|---|---|---|
| Node.js | `package.json` | `engines.node` |
| Node.js | `.nvmrc` | the file contents |
| Python | `pyproject.toml` | `[tool.poetry.dependencies] python` or `[project] requires-python` |
| Python | `.python-version` | the file contents |
| Ruby | `Gemfile` | `ruby '3.3.0'` |
| Ruby | `.ruby-version` | the file contents |
| Go | `go.mod` | `go 1.23` |
| Rust | `rust-toolchain` or `rust-toolchain.toml` | `channel` or contents |

When the user has not pinned a version, default to the latest LTS or stable and tell them you picked it.

## When to use a custom image

Build a custom image when:

- The user's `before_script:` installs the same heavy dependencies on every job (Postgres client, Chrome for headless tests, system libraries).
- The recipe needs both language A and language B in the same job and no public image bundles both.

Push the custom image to the project's container registry (`$CI_REGISTRY_IMAGE/ci:tag`) in a one-off build, then reference it from `image:` in subsequent jobs. The user's first pipeline should not jump straight to a custom image; suggest it only after they hit real cost in `before_script:`.

## Registry credentials

For images in GitLab's own registry, `$CI_JOB_TOKEN` is the credential. For private images in another registry:

- Configure CI/CD variables `DOCKER_AUTH_CONFIG` (or per-registry `CI_REGISTRY_USER`/`CI_REGISTRY_PASSWORD` for that host).
- Mark them as masked + protected. See `references/onboarding.md` for the UI path.
