# CI setup: runners, tokens, variables, project settings

One checklist for everything that has to be set up in GitLab, on npm and on the runners before the CI automation
(Renovate, framework watch, fix agent, releases) can run. The background for each part is in `RENOVATE.md`,
`FRAMEWORK-WATCH.md`, `AGENT-FIX.md`, `RELEASE_WORKFLOW.md` ("Releases in CI") and `CI-RUNNERS.md`. Status
2026-11-26: see §6.

## 1. Runners

Every job asks for exactly one size tag (`CI-RUNNERS.md` §4), plus a capability tag where it needs one. Jobs without
tags of their own get `mlr-linux-small-amd64` from `default: tags` in `.gitlab-ci.yml`, so no job runs untagged.

| Size tag | vCPU / RAM | Jobs |
|---|---|---|
| `mlr-linux-xsmall-amd64` | 2 (shared) / 2 GB | `secret_detection`, `pages`, `coverage-report`, `localazy-upload` |
| `mlr-linux-small-amd64` | 2 / 8 GB | `setup`, `supply-chain:*`, `renovate`, `framework-watch`, `semgrep-sast`, `writerside` (default) |
| `mlr-linux-medium-amd64` | 4 / 16 GB | `run-many`, `workspace:typedoc`, `workspace:compodoc`, `nx-migrate`, `rxap-compose`, `agent:fix`, `release:nightly` / `stable` / `publish-only` |
| `mlr-linux-large-amd64` | 8 / 32 GB | `test` (~10 GB peak) |
| `saas-linux-small-amd64` | GitLab-hosted | `release:npm` only |

Capability tags: `docker` (`docker`, `startup`, `e2e:service`) and `e2e` (`e2e:service`). Those jobs do not run in
this project's pipelines today. Overrides: `RELEASE_BUILD_RUNNER_TAG` and `RELEASE_PUBLISH_RUNNER_TAG` (CI variables).

The `mlr-*` tags are meant to be set automatically by the ML-Runner platform. **Until it exists**, add them by hand
to the current runners (Settings → CI/CD → Runners → edit; keep the old tags, other rxap projects still use them):

| Runner | Machine | Add the tags |
|---|---|---|
| 25731501 | e2-standard-8 | `mlr-linux-large-amd64`, `mlr-linux-medium-amd64` |
| 25731714 | e2-standard-4 | `mlr-linux-medium-amd64`, `mlr-linux-small-amd64` |
| 25731692 | e2-standard-2 | `mlr-linux-small-amd64`, `mlr-linux-xsmall-amd64` (it already has `docker`) |

A runner with several size tags also takes smaller jobs; that is fine for the transition. Then:
1. Turn off "Run untagged jobs" on the self-hosted runners (no job of this project is untagged any more).
2. Remove the stale runners 34814006, 34814013, 37411030 (`run-many-mega`), 37446766.
3. Only after that, turn on the GitLab-hosted runners for `release:npm` (§4).

## 2. Tokens (managed in `rxap/terraform`)

The `rxap` group is on the GitLab.com **Free** plan: project access tokens and fine-grained tokens for bots are not
available. Every CI token is a token of a **group service account**, created, given its project membership and
rotated by `rxap/terraform` (`bots.tf`, rotation 90/30 days during `tofu apply`, weekly apply schedule). The token
value goes straight into the CI variable; nobody copies tokens by hand.

| Service account | Email (Cloudflare Email Routing → must be confirmed once) | Role on `rxap/packages` | CI variable |
|---|---|---|---|
| `rxap-maintenance-bot` | `maintenance-bot@rxap.dev` | Developer | `GITLAB_TOKEN` (`framework-watch`, `nx-migrate`, `rxap-compose`) |
| `rxap-agent-bot` | `agent-bot@rxap.dev` | Developer | `AGENT_GITLAB_TOKEN` (`agent:fix`; the job exports it as `GITLAB_TOKEN`) |
| `rxap-release-bot` | `release-bot@rxap.dev` | Maintainer (push to `development` / `latest`) | `RELEASE_GITLAB_TOKEN` |
| `rxap-renovate-bot` | `renovate-bot@rxap.dev` | Developer | `RENOVATE_TOKEN` |
| `rxap-terraform-bot` | `terraform-bot@rxap.dev` | Owner (of the group) | CI token of `rxap/terraform` itself |

All tokens: scopes `api` + `write_repository`. Commit authors: `rxap release bot <release-bot@rxap.dev>`, `rxap
renovate bot <renovate-bot@rxap.dev>`, `rxap agent bot <agent-bot@rxap.dev>`.

- **Email confirmation:** an unconfirmed service account gets `403 primary email address is not confirmed` from the
  API. GitLab sends the confirmation only when the account is created or its email changes, so the Cloudflare
  forwarding rule must exist **before** the apply that creates the account (`rxap.dev` has a catch-all rule).
  A lost confirmation cannot be recovered reliably: `rxap-bot` (`bot@rxap.dev`) never got confirmed, even after it
  was recreated, and was replaced by `rxap-maintenance-bot` and `rxap-agent-bot` (2026-11-27).
- Pushes with these tokens start pipelines (a push with `CI_JOB_TOKEN` would not), which is why the agent and
  `nx-migrate` need a real token. The release push uses `-o ci.skip`.

Other credentials (set by hand):

| CI variable | What | Where |
|---|---|---|
| `OPENROUTER_API_KEY` | `agent:fix` (claudish) | openrouter.ai, a dedicated key **with a monthly spending limit** |
| `GITHUB_COM_TOKEN` (optional) | Renovate: release notes, GitHub rate limit | GitHub fine-grained token, "Public repositories (read-only)", **no** permissions |

**No npm token anywhere.** `release:npm` authenticates through trusted publishing (OIDC) and fails when
`NPM_TOKEN`, `NODE_AUTH_TOKEN` or an `_authToken` is configured.

## 3. CI/CD variables (Settings → CI/CD → Variables)

| Variable | Set by | Visibility | Protected | Note |
|---|---|---|---|---|
| `RELEASE_GITLAB_TOKEN` | Terraform | masked | **yes** | the release jobs only run on `development` / `latest` |
| `GITLAB_TOKEN` | Terraform | masked | no | `migrate/*` and `rxap/compose` are not protected branches |
| `AGENT_GITLAB_TOKEN` | Terraform | masked | no | `renovate/*` and `migrate/*` are not protected branches |
| `RENOVATE_TOKEN` | Terraform | masked | yes | the `renovate` schedules run on `development` |
| `OPENROUTER_API_KEY` | by hand | masked and hidden | no | see below |
| `GITHUB_COM_TOKEN` | by hand | masked | yes | optional |

`OPENROUTER_API_KEY` stays **unprotected**: protecting it would need protected `renovate/*` / `migrate/*` branches,
and only Maintainers may delete protected branches (Free cannot allow single users), so the bots would need
Maintainer. Forks never receive project variables; only members who can push (the owner and the bots) can start a
pipeline that sees it. The spending limit is the real guard.

Optional (defaults in the YAML): `RELEASE_BUILD_RUNNER_TAG` (`mlr-linux-medium-amd64`), `RELEASE_PUBLISH_RUNNER_TAG`
(`saas-linux-small-amd64`), `AGENT_FIX_MAX_ATTEMPTS` (2), `AGENT_FIX_BASE_BRANCH` (default branch).

Pipeline variables (set in the schedule or in "Run pipeline", not in Settings): `RENOVATE=true`,
`SUPPLY_CHAIN_AUDIT=true`, `FRAMEWORK_WATCH=true`, `NX_RELEASE=nightly|stable|publish-only`, `RELEASE_SPECIFIER`.

## 4. Project settings

1. **Protected branches:** `development` and `latest` (push: Maintainers, which includes `rxap-release-bot`).
   `renovate/*` and `migrate/*` stay unprotected.
2. **Environment `npm`:** `release:npm` declares it and the trusted publisher names it. *Protected* environments are
   a Premium feature, so it stays unprotected; the protected `RELEASE_GITLAB_TOKEN` and the protected branches
   guard the release.
3. **Instance runners on** (Settings → CI/CD → Runners): needed by `release:npm`. Safe because every job is tagged
   (§1); no self-hosted runner takes untagged jobs.
4. **Merge requests:** "Pipelines must succeed" on.
5. **Labels:** `agent-fix::gave-up`, `agent-fix::blocked`.
6. **Schedules** (managed in `rxap/terraform`, target branch `development`): Renovate (weeknights + weekends,
   `RENOVATE=true`), Supply-chain audit (`SUPPLY_CHAIN_AUDIT=true`), Framework watch (`FRAMEWORK_WATCH=true`),
   Nightly release (`NX_RELEASE=nightly`, 02:00, **inactive** until the bootstrap of §5). The old `RELEASE_IT`
   schedule is removed.

## 5. npm (laptop, same day as the bootstrap release)

0. **New packages first:** OIDC cannot create a package on npm. Publish the first version of every new package
   by hand from the laptop (CLAUDE.md: the only laptop publish), so `configure` below can register it.
1. `npm login` (account with 2FA), then `node tools/scripts/npm-trust.mjs configure --dry-run`, then without
   `--dry-run` (2FA: tick "skip 2FA for 5 minutes", continue with `--from <name>`), then `npm-trust.mjs check`.
2. **Bootstrap, the same day** (a trust configuration expires after 2 days without a publish): Run pipeline on
   `development` with `NX_RELEASE=nightly` and `RELEASE_SPECIFIER=prerelease`. Retry `release:npm` for failures.
3. Activate the `Nightly release` schedule (`active = true` in `rxap/terraform`).
4. After the first green nightly: revoke the npm publish token of `~/.npmrc` on npmjs.com, then
   `node tools/scripts/npm-trust.mjs lock`.

## 6. Order

1. Runners: `mlr-*` tags, no untagged jobs, stale runners removed (§1). ✓
2. `rxap/terraform`: service accounts, tokens, variables, schedules (§2–§4); confirm every bot email. ✓ (`rxap-bot`
   confirmation pending)
3. Push `development`; the push pipeline must turn green. ✓
4. Renovate and supply-chain audit ran green; framework watch waits for the `rxap-bot` confirmation.
5. Instance runners on (§4).
6. npm trust + bootstrap release (§5), then activate the nightly schedule.
7. Clean up: revoke the GitHub and GitLab tokens hardcoded in `rxap/gitlab-ci` `renovate/renovate.service`, remove
   that directory and its systemd timer.
