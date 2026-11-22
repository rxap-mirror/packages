# CI/CD Catalog reference

Load this when generating a job for a standard task: security scanning, code quality, infrastructure deployment, language-specific build / test pipelines, build provenance, or markdown lint. The skill prefers a GitLab-maintained component over a custom implementation for these tasks.

For project-specific logic (this project's build, test, deploy), write a custom job per `references/recipes.md`.

## Contents

- When to use a component vs writing a custom job
- How GitLab verifies components
- Pinning rules
- Curated components by use case
  - Security scanning
  - Code quality and linting
  - Infrastructure and deployment
  - Language pipelines
  - Build, packaging, provenance
  - Workflow automation and reporting
  - Component development tooling
- Minimal include syntax
- Live lookup (`scripts/catalog-search.sh`)
- Components excluded from the curated list

## When to use a component vs writing a custom job

| Situation | Action |
|---|---|
| Standard cross-project task (SAST, scanning, IaC deploy, common language pipeline) | Use a component. Saves the user job-writing and earns free upgrades. |
| Project-specific build, test, or deploy logic | Write a custom job using `references/recipes.md`. |
| Standard task but no fitting component exists | Write a custom job; flag for the user as a gap worth revisiting. |

## How GitLab verifies components

The Catalog assigns each component a `verificationLevel`:

- **GITLAB_MAINTAINED** (tanuki badge): "GitLab.com components that are created and maintained by GitLab" ([docs](https://docs.gitlab.com/ci/components/#verification-badges)). Prefer these.
- **GITLAB_PARTNER_MAINTAINED**: "GitLab.com components that are independently created and maintained by a GitLab-verified partner" ([docs](https://docs.gitlab.com/ci/components/#verification-badges)). Acceptable when no GitLab-maintained component fits. GitLab notes that partner components are provided as-is without warranty.
- **VERIFIED_CREATOR_MAINTAINED**: "Components created and maintained by a user verified by an administrator" ([docs](https://docs.gitlab.com/ci/components/#verification-badges)). Applies on self-managed and dedicated instances; the administrator designates the verified creator.
- **UNVERIFIED**: everything else. Use only with caution and after auditing the component.

The skill confirms a component's verification level via the live GraphQL lookup (`scripts/catalog-search.sh`), not by inspecting URLs. When recommending, state the verification level so the user knows what they are getting.

## Pinning rules

Always pin to a release tag. Never `@~latest`, `@main`, or `@master`. The `include: component:` syntax requires an `@<version>` suffix:

- **Semantic release tag** (recommended): `@1.0.0`, `@2.3.4`. Pinned, auditable, predictable.
- **Major.minor**: `@1.0`. Resolves to the latest patch on that line. Acceptable when the component follows semver and the user accepts patch upgrades.
- **Commit SHA (full)**: `@abc123...`. Pinned tightest. Use when the component has no releases yet and the user accepts the maintenance burden.

The skill fetches the current latest version via the live lookup at recommendation time. This file does not pin versions; pinning is decided per-recommendation against fresh data.

## Curated components by use case

When the user asks for one of the tasks below, recommend the named component from the GITLAB_MAINTAINED set. Look up the current latest version via the live lookup before generating the `include:` block. The descriptions below are static metadata, not freshness signals.

### Security scanning

| Component | Purpose |
|---|---|
| `components/sast` | Static Application Security Testing across many languages. |
| `components/dependency-scanning` | Dependency vulnerability scanning, SBOM, software composition analysis. Marked BETA upstream. |
| `components/secret-detection` | Detect committed secrets in the repo. |
| `components/container-scanning` | Scan Docker images for known CVEs. |
| `components/vulnerability-prioritizer` | Prioritize vulnerabilities surfaced by `dependency-scanning` and `container-scanning`. **EXPERIMENTAL** upstream; expect API and output changes. Recommend only when the user explicitly asks for prioritization, not as a default. |

### Code quality and linting

| Component | Purpose |
|---|---|
| `components/code-quality-oss/codequality-os-scanners-integration` | CI templates integrating open-source code quality scanners with GitLab. Successor to `components/code-quality`. |
| `components/code-quality` | CodeClimate-based code quality scanning. **DEPRECATED**: upstream points users at `components/code-quality-oss/codequality-os-scanners-integration`. Recommend only for users already on it who want a migration path. |
| `components/markdownlint` | Markdown lint. |

### Infrastructure and deployment

| Component | Purpose |
|---|---|
| `components/opentofu` | OpenTofu / Terraform plan and apply pipeline. |
| `components/fluxcd` | Build OCI artifacts for use with FluxCD GitOps deployments. |

### Language pipelines

| Component | Purpose |
|---|---|
| `components/go` | Go format, build, test. |
| `components/ruby` | Build, lint, test, deploy Ruby projects. |
| `components/rust` | Rust build, test, doc, run. |

### Build, packaging, provenance

| Component | Purpose |
|---|---|
| `components/slsa` | SLSA-compliant build provenance. |
| `components/package` | Container operations: Cosign signing, ECR migration. Recommend only when the user explicitly asks for container signing or ECR. |

### Workflow automation and reporting

These run from `.gitlab-ci.yml` but operate on the GitLab project itself (issues, MRs, dashboards), not the codebase's build / test / deploy.

| Component | Purpose |
|---|---|
| `components/gitlab-triage` | Run issue, merge request, and epic automations on a schedule (auto-label, auto-close stale, etc.). Useful as a scheduled pipeline. |
| `components/vsd-reports-generator` | Generate scheduled Value Stream Dashboard reports. |

### Component development tooling

| Component | Purpose |
|---|---|
| `components/toolkit` | Helpers for developing your own GitLab CI/CD components. Use only when the user is authoring a CI component, not when they are using one. |

## Minimal include syntax

Every component follows the same shape. The `@<version>` is mandatory:

```yaml
include:
  - component: gitlab.com/<fullPath>/<template>@<version>
    inputs:
      key: value
```

Concrete example with SAST:

```yaml
include:
  - component: gitlab.com/components/sast/sast@3.4.0
```

When the component exposes a single template, the convention is `<name>/<name>`. When multiple templates exist (e.g. `gitlab.com/components/opentofu/full-pipeline` vs `gitlab.com/components/opentofu/validate`), reference the specific one. Check the component's `templates/` directory or the README.

Stack the includes when more than one applies:

```yaml
include:
  - component: gitlab.com/components/sast/sast@<version>
  - component: gitlab.com/components/secret-detection/secret-detection@<version>
  - component: gitlab.com/components/dependency-scanning/main@<version>
```

## Live lookup (`scripts/catalog-search.sh`)

The Catalog is queryable via GraphQL. The skill bundles a bash script that wraps the query:

```bash
scripts/catalog-search.sh [VERIFICATION] [SORT] [LIMIT] [SEARCH]
```

It returns raw GraphQL JSON. Parse it with `jq` or any other JSON tool to extract the fields you need: `name`, `fullPath`, `description`, `topics`, `last30DayUsageCount`, `starCount`, `archived`, and the latest release tag under `versions.nodes[0].name`.

The script accepts all four `verificationLevel` values: `GITLAB_MAINTAINED` (default), `GITLAB_PARTNER_MAINTAINED`, `VERIFIED_CREATOR_MAINTAINED`, `UNVERIFIED`. Useful sort orders: `USAGE_COUNT_DESC` (default), `LATEST_RELEASED_AT_DESC`, `STAR_COUNT_DESC`, `NAME_ASC`.

When to invoke:

- Before recommending any component, to fetch the current latest version for `@<version>` pinning.
- To check whether a candidate component is GITLAB_MAINTAINED (verify the badge, do not assume from the URL).
- When a user task does not match the curated tables above. Search by keyword: `scripts/catalog-search.sh GITLAB_MAINTAINED USAGE_COUNT_DESC 50 <keyword>`.
- To enumerate partner-maintained or verified-creator components for tasks the GitLab-maintained set does not cover.

See the script's docstring for the full flag reference.

## Components excluded from the curated list

GITLAB_MAINTAINED components not in the tables above, with why:

- **`components/ai-catalog`**: tooling for syncing AI catalog agents from YAML definitions. Internal-facing utility, not a CI pipeline step for typical users.
- **`components/android-dependency-scanning`**: ARCHIVED upstream. Do not recommend.

## When no GITLAB_MAINTAINED component fits

Some common tasks have no GITLAB_MAINTAINED component today: DAST scanning, AWS deployment, Auto DevOps. For these, recommend GitLab's built-in CI templates instead: `DAST.gitlab-ci.yml`, `AWS/Deploy-ECS.gitlab-ci.yml`, `Auto-DevOps.gitlab-ci.yml`. See <https://docs.gitlab.com/ci/examples/>.

For tasks not covered by either the curated list or a built-in template, fall back to a custom job per `references/recipes.md`, or search broader verification levels via `scripts/catalog-search.sh GITLAB_PARTNER_MAINTAINED` and `scripts/catalog-search.sh VERIFIED_CREATOR_MAINTAINED`.
