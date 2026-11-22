# GitLab CI mental model

Load this when you need to explain "what is GitLab CI" to a user, or when placing a recommendation in context. It is the conceptual frame `docs.gitlab.com/ci/` teaches new users. Anchor your explanations here instead of inventing your own.

## The four-step journey

GitLab teaches CI/CD as a sequence:

1. **Configure your pipeline** in `.gitlab-ci.yml`.
2. **Find or create runners** to execute jobs.
3. **Use CI/CD variables and expressions** for configuration and secrets.
4. **Use CI/CD components** to compose reusable, versioned units.

Most user questions fit into exactly one of those four buckets. Use that as a routing layer.

## 1. Configure your pipeline

The fundamental unit is a **pipeline**. A pipeline is defined in a single file at the repo root: `.gitlab-ci.yml`.

A pipeline contains **jobs**. Jobs are grouped into **stages**. Within a stage, jobs run in parallel. Stages themselves run sequentially: every job in `build` finishes before any job in `test` starts. The canonical first pipeline GitLab shows new users has three stages: `build`, `test`, `deploy`.

The DAG model (using `needs:` to declare per-job dependencies, bypassing strict stage ordering) is an optimization on top of this base model. Teach stages first; introduce `needs:` when stages start blocking obvious parallelism.

Reference: `docs.gitlab.com/ci/pipelines/`, `docs.gitlab.com/ci/jobs/`.

## 2. Find or create runners

A **runner** is a machine that executes jobs. The user almost never needs to think about this.

- On **gitlab.com free tier**, GitLab provides **hosted instance runners** automatically. Linux, Windows, macOS. No setup. Jobs run on fresh VMs. This is the default and the recommended path for any new user.
- **Self-managed runners** (group, project, or instance) exist for users with custom infrastructure, on-premises hardware, or special compliance needs. Advanced.

When a new user asks "where will my jobs run", the answer is: "automatically, on free GitLab.com runners, you do not need to set anything up". Reserve the runner conversation for users who explicitly ask about self-hosted runners or have a compliance requirement.

Reference: `docs.gitlab.com/ci/runners/`.

## 3. Use CI/CD variables and expressions

Variables come in two flavors:

- **Predefined variables**: built in by GitLab, available in every job. Common ones: `$CI_COMMIT_BRANCH`, `$CI_COMMIT_TAG`, `$CI_PIPELINE_SOURCE`, `$CI_PROJECT_DIR`, `$CI_REGISTRY`, `$CI_REGISTRY_IMAGE`, `$CI_REGISTRY_USER`, `$CI_REGISTRY_PASSWORD`, `$CI_COMMIT_REF_SLUG`, `$CI_JOB_NAME`, `$CI_DEFAULT_BRANCH`. Full list: `docs.gitlab.com/ci/variables/predefined_variables/`.
- **CI/CD variables**: user-configured. Set in **Settings > CI/CD > Variables** in the GitLab project UI. Can be marked **masked** (hidden from job logs) and **protected** (only available on protected branches and tags).

For brand-new pipelines with secrets, the realistic v1 default is masked + protected CI/CD variables. For production deployments, GitLab is steering users toward [external secret management](https://docs.gitlab.com/ci/secrets/) (HashiCorp Vault, AWS Secrets Manager, GCP Secret Manager). Mention this direction; do not force it on a first-pipeline user.

Reference syntax in `.gitlab-ci.yml` is always `$VAR_NAME`, not `${{ }}`. Variables are environment variables inside jobs, so they work with normal shell expansion in `script:`.

Reference: `docs.gitlab.com/ci/variables/`.

## 4. Use CI/CD components

A **CI/CD component** is a reusable, versioned pipeline configuration unit. Components live in projects that publish to the **CI/CD Catalog** at `gitlab.com/explore/catalog`.

The `include:` syntax:

```yaml
include:
  - component: gitlab.com/components/opentofu/full-pipeline@1.0.0
    inputs:
      version: 1.8.0
```

Components carry one of four verification levels in the Catalog (see [`docs.gitlab.com/ci/components/#verification-badges`](https://docs.gitlab.com/ci/components/#verification-badges)):

- **GitLab-maintained** (tanuki badge): created and maintained by GitLab. Prefer for standard tasks (SAST, container scanning, Terraform/OpenTofu).
- **GitLab Partner**: independently created and maintained by a GitLab-verified partner. Provided as-is without warranty.
- **Verified creator**: maintained by a user verified by an administrator (self-managed and dedicated instances).
- (no badge): unverified. Use only with caution and after auditing.

See `references/catalog.md` for the verified components the skill recommends and the live lookup script.

Version pinning is mandatory. Always pin to a release tag. Never use `~latest`. Pinning to a commit SHA, semantic version tag, or branch name all work; the recommended form is a semantic version tag.

When the user asks for a job that fits a standard task (SAST, container scanning, infrastructure deployment, Docker build), search `references/catalog.md` first. If a curated component exists for the task, recommend it instead of a custom implementation.

Reference: `docs.gitlab.com/ci/components/`.

## Post-commit experience

When the user pushes their first commit with a `.gitlab-ci.yml`:

1. GitLab detects the file and creates a pipeline automatically.
2. The pipeline runs on free hosted runners (on gitlab.com) or on the user's registered runners (self-managed).
3. The user finds the pipeline under **Build > Pipelines** in the GitLab project UI.
4. Each job has a log accessible by clicking the job name in the pipeline graph.

Tell the user to expect this. Tell them where to look.

## Idiomatic patterns to prefer

- **Hidden jobs** (`.base`) + `extends:` for reuse. Not YAML anchors.
- **`default:`** at the top of the file for fields shared by most jobs (`image`, `before_script`, `tags`).
- **`workflow:rules:`** to gate pipeline creation (run only on MR, run only on default branch, etc.).
- **`rules:`** (not `only:` or `except:`, both deprecated) for per-job conditional execution.
- **Job names** that read as English phrases: `lint code`, `build image`, `test python 3.11`. Reserved keywords (`image`, `services`, `stages`) cannot be used as job names. Maximum 255 characters.
- **Parallel variants**: `test ruby 1/3`, `test ruby 2/3`, `test ruby 3/3` (or `parallel: 3` if the script handles the index). GitLab's UI groups these visually.
