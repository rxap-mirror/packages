# Renovate

Renovate keeps the dependencies of this repository up to date. It runs as a scheduled CI job of this project
(`.gitlab/ci/renovate.yml`), not as an external runner, so it only needs a token for this project.

## How an update gets in

1. **Cooldown before any branch.** `renovate.json5` sets `minimumReleaseAge: 30 days` (the strictest tier, also for
   unknown packages) with `internalChecksFilter: strict`. `renovate-tiers.json` (generated, `pnpm renovate:tiers`)
   lowers it to 7 days for packages with >= 1M weekly downloads and 14 days for >= 100k. Younger releases stay
   "pending" on the dependency dashboard; security fixes wait as well.
2. **Only the root manifest.** Renovate updates `package.json` (exact versions, `rangeStrategy: pin`), CI images and
   Dockerfiles. Not: the package manifests, the `pnpm-workspace.yaml` overrides (cooldown / security pins),
   `engines`, our own CI components.
3. **Post-upgrade** (`tools/scripts/renovate-post-upgrade.mjs`) on every branch: copies the root ranges into the
   packages, classifies new dependencies, updates the lockfile and pins transitive versions that are too young.
4. **Merge request pipeline:** the workspace pipeline plus `supply-chain:check` (tiered cooldown of every added
   version, `pnpm audit` high/critical).
5. **Automerge** for patch, minor, pin, digest and the weekly lockfile maintenance once the pipeline is green.
   Majors need approval on the dependency dashboard and are merged by hand.

Not updated by Renovate (disabled in `renovate.json5`): `@rxap/*`, Angular, Nx, NestJS (framework watch,
`FRAMEWORK-WATCH.md`), and the majors held back in `UPGRADE-NOTES.md` section 4.

Red Renovate merge requests get one or two repair attempts from the fix agent (`AGENT-FIX.md`). Renovate treats
the agent's commit as a manual change and stops rebasing that branch; automerge still applies once the pipeline is
green.

Never merge a Renovate merge request by hand while `supply-chain:check` is red. A pending update only needs time;
an exception follows the process in `UPGRADE-NOTES.md` section 4.

## Changing the configuration

- Validate: `docker run --rm -v "$PWD:/cfg:ro" -w /cfg --entrypoint renovate-config-validator <image of .gitlab/ci/renovate.yml> --strict renovate.json5 renovate-tiers.json`
- Dry run without token or merge requests (on a clean clone, `local>` presets do not resolve with
  `--platform=local`, inline `renovate-tiers.json` into the clone's config first):
  `docker run --rm -v "<clone>:/usr/src/app" -w /usr/src/app -e RENOVATE_PLATFORM=local -e RENOVATE_DRY_RUN=lookup -e RENOVATE_REQUIRE_CONFIG=required -e LOG_LEVEL=debug <image>`
  ("packageFiles with updates" in the log lists every proposed update with `pendingChecks`).
- The Renovate image in `.gitlab/ci/renovate.yml` is pinned by version and digest and updates itself through Renovate
  (30-day cooldown for Docker images).

## Activation checklist (once `development` is pushed)

All setup steps of every CI automation in one checklist (runners, tokens with fine-grained permissions, variables,
settings, order): `CI-SETUP.md`.

1. **Bot token:** Settings → Access tokens → project access token `renovate-bot`, role *Developer*, scopes `api` and
   `write_repository`, with an expiry date. Store it as CI/CD variable `RENOVATE_TOKEN` (masked, protected).
2. Optional: a fine-grained GitHub token without permissions (public read, for release notes and the rate limit) as
   `GITHUB_COM_TOKEN` (masked, protected).
3. **Schedules** (CI/CD → Schedules, target branch `development`):
   - `Renovate`: hourly between 19:00 and 06:00 plus weekends, variable `RENOVATE=true`;
   - `Supply-chain audit`: daily, variable `SUPPLY_CHAIN_AUDIT=true`.
4. **Merge request settings:** "Pipelines must succeed" on (otherwise platform automerge merges without a pipeline),
   and `renovate/*` branches allowed to push for the bot.
5. Run the `Renovate` schedule once by hand, check the job log and the "Dependency Dashboard" issue.
6. Check that the scheduled pipelines only contain the `renovate` / `supply-chain:audit` job.
7. Framework watch and fix agent: activation steps in `FRAMEWORK-WATCH.md` and `AGENT-FIX.md` (`GITLAB_TOKEN`,
   `OPENROUTER_API_KEY`, schedule `FRAMEWORK_WATCH=true`). The Renovate bot token may serve as `GITLAB_TOKEN` too.
8. Retire the old Renovate runner (`rxap/gitlab-ci` `renovate/`, systemd timer) and revoke the tokens hardcoded in its
   `renovate.service`.
