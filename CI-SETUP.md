# CI setup: runners, tokens, variables, project settings

One checklist for everything that has to be set up in GitLab, on npm and on the runners before the CI automation
(Renovate, framework watch, fix agent, releases) can run. The background for each part is in `RENOVATE.md`,
`FRAMEWORK-WATCH.md`, `AGENT-FIX.md`, `RELEASE_WORKFLOW.md` ("Releases in CI") and `CI-RUNNERS.md`. Status
2026-11-25: nothing below is set up yet; do it together with the push of `development`.

## 1. Runners

Tags the jobs ask for **today** (the `mlr-linux-*` size tags of `CI-RUNNERS.md` §4 are proposed, not applied):

| Tag | Jobs | Needs at least | Runner today |
|---|---|---|---|
| `setup` | `setup` | 2 vCPU / 4 GB, fast network | 25731714 (e2-standard-4), online |
| `run` | `supply-chain:*`, `renovate`, `framework-watch`, `agent:fix`, `workspace:typedoc`, `workspace:compodoc` | 4 vCPU / 16 GB | 25731501 (e2-standard-8), online |
| `run-many-mega` | `run-many`, `test`, `release:nightly` / `stable` / `publish-only` (`RELEASE_BUILD_RUNNER_TAG`) | 8 vCPU / 32 GB (`test` peaks at ~10 GB) | 37411030, **stale since 2025-09-29** |
| `saas-linux-small-amd64` | `release:npm` only (`RELEASE_PUBLISH_RUNNER_TAG`) | GitLab-hosted | needs "Instance runners" on |
| untagged | `writerside`, `semgrep-sast`, `secret_detection`, `pages`, `coverage-report` | 1–2 vCPU / 2–4 GB | 25731692, 60080662 |

To do:
1. **`run-many-mega`:** register a runner with this tag (8 vCPU / 32 GB), or add the tag to the online
   e2-standard-8 runner 25731501. Without it no pipeline turns green, and the nightly release waits forever.
2. **Before enabling the GitLab-hosted runners** (needed by `release:npm`): give every untagged job a tag (apply the
   `CI-RUNNERS.md` §4 tags, or tag those five jobs) and turn off "Run untagged jobs" on the self-hosted runners.
   Otherwise the untagged jobs land on the hosted runners again and use the 400 free minutes.
3. Remove the stale runners 34814006, 34814013, 37411030, 37446766 once the replacement runs.

## 2. Tokens

**Fine-grained tokens only exist as personal access tokens.** GitLab 19.2 made them GA for every tier, but
project access tokens, group access tokens and service accounts still use the old scopes (`api`,
`write_repository`, …). A fine-grained token therefore needs a **user**: create a separate GitLab account (for
example `rxap-bot`), add it to `rxap/packages` with the role below, and create the tokens in that account
(Edit profile → Access → Personal access tokens → Generate token → *Fine-grained token*). Access: *selected
groups and projects* → only `rxap/packages`. Every request needs both the token permission and the role of the bot
account, so the role still matters (protected branches, protected environment).

Permissions are **Resource: actions**, all on the project boundary `rxap/packages`.

| CI variable | Used by | Role of the bot | Fine-grained permissions | Old-style alternative (project access token) |
|---|---|---|---|---|
| `RELEASE_GITLAB_TOKEN` | release build jobs: push the release commit + tags to `development` / `latest`, read the pipeline status (gate), create GitLab releases (stable) | Maintainer (push to the protected branches; or Developer + "allowed to push") | Code: Download, Push · Project: Read · Pipeline: Read · Release: Read, Create | `release-bot`, Maintainer, `api` + `write_repository` |
| `GITLAB_TOKEN` | `framework-watch` (branches, MRs, notes), `nx-migrate` (push `migrate/*`, open the MR), `agent:fix` (push the fix, job traces, MR labels + notes) | Developer | Code: Download, Push · Project: Read · Branch: Read, Create, Delete · Merge Request: Read, Create, Update · Work Item: Create (MR notes: check on the first run) · Pipeline: Read · Job: Read | Developer, `api` + `write_repository` |
| `RENOVATE_TOKEN` | `renovate` | Developer | **Use the project access token.** Renovate calls many more endpoints (user, version, tree, commit statuses, issues for the dependency dashboard, labels, approvals) and does not document fine-grained tokens | `renovate-bot`, Developer, `api` + `write_repository` |

- `GITLAB_TOKEN` and `RENOVATE_TOKEN` may be the same token if you accept the broader rights; separate tokens keep
  a leak smaller.
- The `glab` calls of the claude component (`agent:fix`) may also need **User: Read** (`glab` asks `/user`). If
  the first run fails with 403, add it.
- Set an expiry date on every token and a calendar reminder to rotate it.
- Pushes with these tokens start pipelines (a push with `CI_JOB_TOKEN` would not), which is why the agent and
  `nx-migrate` need a real token. The release push uses `-o ci.skip`.

Other credentials:

| CI variable | What | Where |
|---|---|---|
| `OPENROUTER_API_KEY` | `agent:fix` (claudish) | openrouter.ai, a dedicated key **with a monthly spending limit** |
| `GITHUB_COM_TOKEN` (optional) | Renovate: release notes, GitHub rate limit | GitHub fine-grained token, "Public repositories (read-only)", **no** permissions |

**No npm token anywhere.** `release:npm` authenticates through trusted publishing (OIDC) and fails when
`NPM_TOKEN`, `NODE_AUTH_TOKEN` or an `_authToken` is configured.

## 3. CI/CD variables (Settings → CI/CD → Variables)

| Variable | Visibility | Protected | Note |
|---|---|---|---|
| `RELEASE_GITLAB_TOKEN` | masked and hidden | **yes** | the release jobs only run on `development` / `latest` |
| `GITLAB_TOKEN` | masked and hidden | **no**, unless `migrate/*` and `renovate/*` become protected branches | protected variables only reach protected branches |
| `RENOVATE_TOKEN` | masked and hidden | yes | the `renovate` schedule runs on `development` |
| `OPENROUTER_API_KEY` | masked and hidden | no (same reason as `GITLAB_TOKEN`) | |
| `GITHUB_COM_TOKEN` | masked | yes | optional |

Optional (defaults in the YAML): `RELEASE_BUILD_RUNNER_TAG` (`run-many-mega`), `RELEASE_PUBLISH_RUNNER_TAG`
(`saas-linux-small-amd64`), `AGENT_FIX_MAX_ATTEMPTS` (2), `AGENT_FIX_BASE_BRANCH` (default branch).

Pipeline variables (set in the schedule or in "Run pipeline", not in Settings): `RENOVATE=true`,
`SUPPLY_CHAIN_AUDIT=true`, `FRAMEWORK_WATCH=true`, `NX_RELEASE=nightly|stable|publish-only`, `RELEASE_SPECIFIER`.

## 4. Project settings

1. **Protected branches** (Settings → Repository): `development` and `latest`: allowed to push for Maintainers
   (or the bot explicitly). `renovate/*` and `migrate/*` must be pushable by the bot (not protected, or the bot
   allowed).
2. **Protected environment `npm`** (Settings → CI/CD → Protected environments; the environment exists after the
   first `release:npm` run, or create it under Operate → Environments): deployments by Maintainers + the bot.
3. **Instance runners on** (Settings → CI/CD → Runners), only after §1 step 2.
4. **Merge requests:** "Pipelines must succeed" on.
5. **Labels:** `agent-fix::gave-up`, `agent-fix::blocked`.
6. **Schedules** (Build → Pipeline schedules, target branch `development`):

   | Schedule | Cron | Variable |
   |---|---|---|
   | Renovate | hourly 19:00–06:00 + weekends | `RENOVATE=true` |
   | Supply-chain audit | daily | `SUPPLY_CHAIN_AUDIT=true` |
   | Framework watch | daily | `FRAMEWORK_WATCH=true` |
   | Nightly release | daily 02:00 | `NX_RELEASE=nightly` (create it after the bootstrap, §5) |

   **Delete** the old schedule "Nightly release" with `RELEASE_IT=true` (1575893; created by the group Terraform,
   so remove it there too, or it comes back).

## 5. npm (laptop, same day as the bootstrap release)

1. `npm login` (account with 2FA), then `node tools/scripts/npm-trust.mjs configure --dry-run`, then without
   `--dry-run` (2FA: tick "skip 2FA for 5 minutes", continue with `--from <name>`), then `npm-trust.mjs check`.
2. **Bootstrap, the same day** (a trust configuration expires after 2 days without a publish): Run pipeline on
   `development` with `NX_RELEASE=nightly` and `RELEASE_SPECIFIER=prerelease`. Retry `release:npm` for failures.
3. Create the `Nightly release` schedule (§4).
4. After the first green nightly: revoke the npm publish token of `~/.npmrc` on npmjs.com, then
   `node tools/scripts/npm-trust.mjs lock`.

## 6. Order

1. Runners (§1 step 1), tag the untagged jobs (§1 step 2).
2. Bot account + tokens, variables, labels, protected branches (§2–§4).
3. Push `development`; the push pipeline must turn green.
4. Run the `Renovate` and `Framework watch` schedules once by hand, check the logs.
5. Instance runners on, protected environment `npm`.
6. npm trust + bootstrap release (§5), then the nightly schedule.
7. Clean up: revoke the GitHub and GitLab tokens hardcoded in `rxap/gitlab-ci` `renovate/renovate.service`, remove
   that directory and its systemd timer, delete the `RELEASE_IT` schedule.
