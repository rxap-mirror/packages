# CI runners: pipeline paths, measured job sizes, runner classes

Status 2026-11-25. Basis: the merged configuration of the local `.gitlab-ci.yml` (GitLab lint API, component
`nx-workspace@6.4.0-edge.65`), the job history of the last 100 pipelines (2026-06-26 → 2026-11-24) and local
measurements (process tree sampled every 500 ms, cores pinned with `taskset`). Nothing in this file is applied yet.

## 1. Current state (blockers)

| # | Finding | Effect |
|---|---|---|
| 1 | Runner `run-many-mega` (37411030) is **stale since 2025-09-29** | `run-many` + `test` never run (60× `stuck_pending_no_matching_runners`); no pipeline is green, so the release gate (`RELEASE_WORKFLOW.md`) can never pass |
| 2 | Untagged jobs (`writerside`, `semgrep-sast`, `secret_detection`, `pages`, …) ran on **GitLab-hosted** `saas-linux-small` until 2026-11-24 | ≈ 4 hosted minutes per pipeline. `shared_runners_enabled` is `false` now, but `release:npm` needs it `true` — then every untagged job lands there again |
| 3 | Schedule `Nightly release` (`RELEASE_IT=true`, 02:00) | started a full pipeline 36× (all red). The local workflow rule drops it after the push; delete the schedule anyway |
| 4 | Tag pipelines fail with `environment_creation_failure` (`release/@rxap/…@x.y.z`) | gone for new releases (tags are pushed with `ci.skip`) |
| 5 | `workspace:typedoc` fails (CI: 13× `script_failure`, also locally) | separate fix |
| 6 | Two script lines were YAML maps (`- echo "RUN: …"`) | fixed in `edfed3858`; the configuration was invalid before |

Online runners: 25731501 `run`, `run-many`, `dte-agent` (e2-standard-8) · 25731714 `setup`, `e2e`, `testing`
(e2-standard-4) · 25731692 `docker`, `kaniko`, `startup`, `service-e2e`, `component-test`, `run-dte` + untagged
(e2-standard-2) · 60080662 "Packages", untagged only. Stale: 34814006, 34814013, 37411030, 37446766.

## 2. Pipeline paths

| Path | Trigger | Jobs (stage) |
|---|---|---|
| Push `development` (default) | push | `setup` (.pre) → `test`, `semgrep-sast`, `secret_detection` (test) → `run-many` (build), `writerside`, `workspace:typedoc`, `workspace:compodoc` (build) → `pages`, `coverage-report`, `trigger:rxap-compose` (.post) |
| Push `latest` | push | as above, `pages` + `coverage-report` manual, no `writerside` / rxap-compose |
| `renovate/*` branch / MR | push, MR | `setup`, `supply-chain:check`, `workspace:typedoc`; red → `agent:fix` |
| `migrate/*` branch | push | `nx-migrate` (+ `agent:fix` on a red MR pipeline) |
| `NX_MIGRATE_PACKAGE` / `RXAP_COMPOSE` | trigger | workspace pipeline + `trigger:nx-migrate` / `trigger:rxap-compose` |
| AI issue / epic | `AI_ISSUE_IID` / `AI_EPIC_IID` | `agent:fix:issue`, `agent:fix:issue:epic` (+ child pipeline) |
| Schedule `RENOVATE=true` | schedule | `renovate` |
| Schedule `SUPPLY_CHAIN_AUDIT=true` | schedule | `supply-chain:audit` |
| Schedule `FRAMEWORK_WATCH=true` | schedule | `framework-watch` |
| `NX_RELEASE=nightly` / `stable` / `publish-only` | schedule / web | `release:nightly` / `release:stable` / `release:publish-only` → `release:npm` (hosted) |
| Tag `@rxap/*@*` | push | none for new releases (`ci.skip`) |

## 3. Measured job sizes

Local machine, `--skip-nx-cache`, `NX_DAEMON=false` (as in CI). "Cores" = busy cores (average / 95th percentile).

| Workload | Wall | Peak RAM | Cores avg / p95 |
|---|---|---|---|
| Nx project graph only (`nx show projects`), default | 10 s | **6.1 GiB** | 5.6 / 14.7 (burst) |
| Nx project graph only, `NX_ISOLATE_PLUGINS=false` | 10 s | **1.1 GiB** | 1.7 / 3.1 |
| Build all (243 tasks, `--parallel 3`), 8 cores | 128 s | 6.1 GiB | 4.8 / 6.2 |
| Build all, 4 cores, `NX_ISOLATE_PLUGINS=false` | 165 s | 3.3 GiB | 3.5 / 3.9 |
| Test all (`--parallel 3`, jest `maxWorkers 2`), 8 cores | 179 s | **9.8 GiB** | 6.1 / 7.8 |
| Test all, 8 cores, `NX_ISOLATE_PLUGINS=false` | 185 s | 10.0 GiB | 6.0 / 7.8 |
| Lint all (`--parallel 3`), 8 cores | 52 s | 6.4 GiB | 4.6 / 5.5 |
| Single project build / test / lint | 10–70 s | 5.3–8.0 GiB | graph-dominated |
| `supply-chain:check` | 3 s | 0.5 GiB | 0.5 / 1.3 |
| `framework-watch` (dry) | 7 s | 0.8 GiB | 0.7 / 2.1 |
| `release-ci.mjs` gate | 12 s | 0.1 GiB | 0.1 / 0.3 |
| `pnpm install --ignore-scripts` (warm store) | 4 s | 0.5 GiB | 1.7 / 2.1 |

From CI (median / max): `setup` 10 / 52 min (download + cache upload, network-bound) · `workspace:typedoc`
19 / 63 min · `writerside` 104 / 137 s · `semgrep-sast` 131 / 164 s · `secret_detection` 17 / 56 s.

Conclusions:
- **Plugin isolation costs ~5 GiB per Nx process** (13 plugins, one worker each, TypeScript sources). Setting
  `NX_ISOLATE_PLUGINS=false` for the CI drops every Nx job by that amount without a speed penalty.
- **Tests are the only memory-heavy workload** (3 parallel projects × 2 jest workers): ~10 GiB.
- The jobs scale with cores up to `--parallel 3`; more cores than ~8 are not used.
- Everything that is not Nx (scripts, triggers, scanners, pages) needs ≤ 1 core and ≤ 2–4 GiB.

## 4. Proposed runner classes and tags

Size tags named like GitLab's hosted runners (`saas-linux-<size>-amd64`), plus capability tags that combine with
a size. A job always asks for exactly one size tag.

| Size tag | vCPU / RAM | GCP type | For |
|---|---|---|---|
| `rxap-linux-xsmall-amd64` | 2 (shared) / 2 GB | e2-small | triggers (glab), `pages`, `coverage-report`, `secret_detection` |
| `rxap-linux-small-amd64` | 2 / 8 GB | e2-standard-2 | `setup`, `supply-chain:*`, `framework-watch`, `renovate`, `semgrep-sast`, `writerside` |
| `rxap-linux-medium-amd64` | 4 / 16 GB | e2-standard-4 | `run-many` (build), lint, `workspace:typedoc`, `workspace:compodoc`, `nx-migrate`, `rxap-compose`, `agent:fix*`, `release:nightly` / `stable` / `publish-only` |
| `rxap-linux-large-amd64` | 8 / 32 GB | e2-standard-8 | `test` |
| `saas-linux-small-amd64` | GitLab-hosted | — | `release:npm` only |

Capability tags: `docker` (privileged / BuildKit: `docker`, `startup`, `service-e2e`), `e2e` (browser
dependencies). The old tags (`run`, `run-many`, `run-many-mega`, `setup`, …) stay on the new runners as aliases
until every consumer project uses the new names.

Rules:
1. **No untagged jobs.** Every job gets a size tag (the GitLab templates `semgrep-sast`, `secret_detection`,
   `writerside`, `pages`, `coverage-report` via a local override), and the self-hosted runners do not run untagged
   jobs. Then enabling the hosted runners for `release:npm` cannot leak other jobs onto them.
2. `NX_ISOLATE_PLUGINS=false` and `NX_DAEMON=false` for all Nx jobs.
3. `test` gets its own tag input (today it shares `run_many_tags` with `run-many`): component input
   `test_tags` in rxap/gitlab-ci, or a local override of `test:tags`.

Expected effect: the workspace pipeline needs one large and a few medium/small machines for minutes instead of
an 8-core/32 GB machine per job; with `run-many` and `test` running again the pipeline can turn green.

## 5. Open decisions

- Runner platform: GKE node pools (Kubernetes executor, per-job requests) or GCE autoscaling VMs (docker-autoscaler,
  one VM per job). With Kubernetes the classes become CPU/memory requests instead of machine types.
- Whether the tag names apply to all rxap projects (component defaults in rxap/gitlab-ci) or only to this one.
