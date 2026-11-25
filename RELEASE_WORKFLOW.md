# Release Workflow

Releases are driven by **`nx release`** (Nx 22.x) through the orchestrator at
[`tools/scripts/release.mjs`](tools/scripts/release.mjs). This replaced the former Lerna +
bash-hook pipeline; the orchestrator preserves every pre-step that pipeline performed.

**Releases run in CI** (section [Releases in CI](#releases-in-ci)): a nightly `-dev` prerelease of
`development`, the stable graduation as a manual pipeline. npm is reached through trusted publishing only, no npm
token exists. The laptop flow below stays as the fallback and for the first version of a new package.

## Prerequisites

- Only for `--gitlab-release`: the [`glab`](https://gitlab.com/gitlab-org/cli) CLI must be installed
  and authenticated (`glab auth login`). No token in `.env` is needed.
- You must be on a release branch: `development`, `latest`, `next`, `next-major`, `beta`,
  `alpha`, `master`, or a maintenance branch `N.x[.x]` / `N.M.x` (optionally `-dev`).
- The working tree must be clean and up-to-date with the remote.

## Run a release

```shell
# preview everything without writing/publishing anything
pnpm release:dry

# perform the release for the current branch
pnpm release
```

The branch determines the release channel (ported from the old scripts):

| Branch | Channel | preid | npm dist-tag |
|---|---|---|---|
| `development`, `*-dev` | prerelease | `dev` | branch name |
| `next` / `next-major` / `beta` / `alpha` | prerelease | branch | branch name |
| `latest` / `master` | stable | – | `latest` |
| `N.x` / `N.M.x` | stable (maintenance) | – | branch name |

Nx keeps a prerelease line incrementing (`-dev.N`) until you **graduate** it. To graduate to a
stable release, run on `latest`/`master` with an explicit specifier, e.g.
`pnpm release --specifier=patch` (or `minor` / `major` / an exact version).

### Bootstrap release (done: first 21 / 22 / 11 prerelease)

The manifests were raised to Angular 21 / Nx 22 / Nest 11 by hand, so no tag existed for these
majors and the `git-tag` resolver would have used the old 19.x/20.x tags. The first release ran
with a temporary `currentVersionResolver: disk` / `specifierSource: prompt` config and
`--specifier=prerelease`; that config has been reverted. Every package now has a tag, so the regular
`git-tag` + conventional-commits flow applies.

### Useful flags

- `--dry-run` – thread dry-run through nx; skip all git/publish/GitLab side effects.
- `--first-release` – required for the very first migrated run (no prior matching tag to diff).
- `--specifier=<x>` – force the version bump for the `packages` group (graduation).
- `--gitlab-release` – also create a GitLab release per released project via `glab`. **Off by
  default**; without the flag the GitLab step is skipped.
- `--gitlab-releases-only` – implies `--gitlab-release`; (re)create the GitLab releases of the latest release run from the
  existing tags and `CHANGELOG.md` files (existing releases are skipped; `--commit=<sha>` selects
  the release commit explicitly). GitLab release creation retries 429/5xx with backoff.
- `--publish-only` – retry just the publish from the existing `dist/` (e.g. after a partial
  publish failure) without re-versioning. Never pushes (the release commit and its tags were pushed before the
  publish). `--rebuild` rebuilds the dist of the projects of the release commit(s) at HEAD first (CI).
- `--pack=<dir>` – pack every released project into `<dir>` (+ `manifest.json`, `publish-tarballs.mjs`) instead of
  publishing; the CI's `release:npm` job uploads them (see "Releases in CI").
- `--skip-validate` / `--skip-build` / `--skip-umbrella` – skip individual phases.
- `YES=true pnpm release` – skip the interactive confirmation.
- `--projects=<a,b>` – release only these projects: dependents are not bumped and the `rxap` umbrella
  pass is skipped. Also limits `--publish-only`.
- `--final` – (requires `--projects`) stable release of the selection on any release branch (dist-tag
  `latest`, `24.0.0-dev.1` → `24.0.0`), while the rest of the workspace stays on its prerelease line.

### Sunsetting a package

1. Add it to `tools/scripts/sunset-packages.json` (message, `finalRelease`) and prefix its
   `package.json` description with `DEPRECATED — <message>` (the README is generated from it).
2. Final stable release: ``pnpm release --final --projects=$(node tools/scripts/deprecate-packages.mjs projects)``
   (dry-run first).
3. `node tools/scripts/deprecate-packages.mjs deprecate` (`--dry-run` first, `check` afterwards).
4. Delete the package and its references (rxap umbrella, composer, `tsconfig.base.json`, README, `nx.json`).

## Package-manager e2e matrix (before a release)

`tools/scripts/e2e-package-managers.mjs` checks that the published packages work for consumers on
npm, yarn (berry, node-modules) and pnpm, plus yarn PnP as informational only. It never touches the real registry:

1. starts Verdaccio on `http://localhost:4873` with its storage in `tmp/e2e-pm/verdaccio/` (the packages of
   this workspace are never proxied to npmjs, everything else, e.g. `@rxap/cli`, is),
2. builds every publishable project, applies the release dist transforms (`dist-transforms.mjs`) and
   publishes a staged copy (`tmp/e2e-pm/publish/`, `dist/` stays untouched) with the dist-tag `e2e` under
   run-unique versions `<version>-e2e.<runId>` (internal ranges and package groups are pinned to them), so no npmjs
   copy and no package-manager cache can serve an older build of the same version,
3. per package manager, in a temp directory outside the repository: `create-nx-workspace --pm <pm>
   --preset apps --workspaces=false --nxCloud skip`, installs the plugins and `schematic-composer` `@e2e`, runs
   `plugin-workspace:init`, `plugin-gitlab-ci:init`, `@nx/angular:library` + `plugin-angular:init-library`,
   adds `nest-server` and `dialog` `@e2e`, and checks: no `yarn` in the lines the generators added
   (pm ≠ yarn), the root `packageManager` is unchanged, `nx run-many -t build` is green, and every installed
   package and every plugin generator/executor implementation loads from the consumer root (this catches
   undeclared dependencies under pnpm's strict layout; a missing *declared peer* is only a warning).

```bash
pnpm nx run workspace:e2e-pm                       # full matrix, ~15 min with a warm Nx cache
pnpm nx run workspace:e2e-pm --pm=pnpm --keep      # one package manager, keep the temp workspace
node tools/scripts/e2e-package-managers.mjs --skip-publish --pm=npm   # reuse the packages already published to tmp/e2e-pm
```

Flags: `--pm=<npm,yarn,pnpm,yarn-pnp>`, `--keep`, `--skip-build` (publish the existing dist),
`--skip-publish`, `--port=<n>`, `--yarn-version=<v>`, `--pnpm-version=<v>` (defaults are pinned,
cooldown-eligible versions run through corepack), `--verbose`. It prints a package-manager × check matrix and
writes `tmp/e2e-pm/report.{md,json}` and per-step logs to `tmp/e2e-pm/logs/<pm>/`. The exit code is 1 when a
required cell fails (any cell except `yarn-pnp`: Nx itself does not run under Yarn PnP). Port 4873 must be free,
so stop `workspace:local-registry` first.

## What the orchestrator does (phase order)

1. **Compute release mode** from the branch (prerelease / preid / dist-tag).
2. **Preflight** – allowBranch guard, `git fetch`, behind/dirty checks, `glab auth status` (only with `--gitlab-release`), confirm.
3. **Validate** – `nx run-many -t build,test,lint --exclude=angular`.
4. **Version (source)** – `releaseVersion` bumps each changed `package.json` and pins internal
   `@rxap/*` dependencies to `^<newVersion>` (native `updateDependents` + `versionPrefix`).
5. **Source mutations** – `update-package-group` (regenerates `nx-migrations.packageGroup`),
   `workspace:readme`, and a lockfile refresh — all on source, **before** the build.
6. **Changelog + tag + commit** – `releaseChangelog` writes `CHANGELOG.md` files, makes a single
   `chore(release): version` commit (absorbing the staged source changes), and tags
   `@rxap/<project>@<version>`.
7. **Production build → dist** – readme/compodoc/typedoc + `build --configuration=production`,
   so `dist/{projectRoot}` carries the bumped version, regenerated package group, and changelog.
8. **Dist transforms** – add the `./theme` export where a `theme.css` exists and strip the
   internal `workspace` marker dependency, remove the ng-prism `@Showcase` decorators
   (`prism-strip`) and verify with `tools/scripts/check-dist-for-ng-prism.mjs` that no built
   package references `@ng-prism` (the release aborts before publishing otherwise). These steps
   live in `tools/scripts/dist-transforms.mjs`, shared with the package-manager e2e matrix above.
9. **Push** – the release commit and exactly this run's tags in one atomic push to `origin/<branch>`
   (`git push --atomic -o ci.skip origin HEAD:refs/heads/<branch> <tags>`; works on a detached HEAD, no pipelines
   for the release commit and the tags). **Before** the publish: a rejected push (the branch moved during the
   release) aborts with nothing published — reset (`git reset --hard origin/<branch>`, delete the printed tags) and
   run again. So a published version always has its tag on the remote.
10. **Publish** – `releasePublish` from `dist/{projectRoot}` with the branch dist-tag/registry.
11. **GitLab releases** – created via the GitLab Releases API (Nx has no native GitLab support), one per published
    project, using the generated changelog as the body (REST API with `RELEASE_GITLAB_TOKEN` in CI, `glab` locally).
12. **rxap umbrella** – regenerate the `rxap` meta-package's package group against the finalized
    member versions, then version/changelog/build/push/publish it as its own release group.

## Configuration

Release behavior is configured under `release` in [`nx.json`](nx.json): two independent release
groups (`packages` for the `tag:packages` libraries, excluding the `demos/**` fixtures that have no
`package.json`; `rxap` for the umbrella), conventional-commit
versioning with the `git-tag` current-version resolver (`disk` fallback for packages without a
matching tag yet), `^` version prefix, per-project changelogs, and
`preserveMatchingDependencyRanges: false` (internal ranges are always re-pinned, prereleases
would otherwise fail the range check), and `nx-release-publish.packageRoot = dist/{projectRoot}` (publish from dist) in `targetDefaults`.

> Tags use `@rxap/{projectName}@{version}` (and `rxap@{version}` for the umbrella). Where an Nx
> project name differs from its published package name (e.g. project `angular-environment` →
> `@rxap/environment`), the existing tag won't match and the current version is read from disk;
> Nx then creates a new-scheme tag going forward. **Run the first migrated release with
> `--first-release`** so changelog generation doesn't require a prior matching tag.

## Releases in CI

`.gitlab/ci/release.yml` → [`tools/scripts/release-ci.mjs`](tools/scripts/release-ci.mjs) → `release.mjs`. Release
pipelines (`NX_RELEASE` set) load only the release jobs; `resource_group: release` keeps them from overlapping.

Every release pipeline has two jobs, so that only the upload costs GitLab compute minutes:

1. **Build job** (`release:nightly` / `release:stable` / `release:publish-only`, our runners,
   `RELEASE_BUILD_RUNNER_TAG`, default `run-many-mega`): gate, version, changelog, release commit, build, dist
   transforms, tags, push — then `release.mjs --pack=dist/release` packs every released project into a tarball and
   lists it in `dist/release/manifest.json` (artifact, 2 weeks). It has no npm credentials. Exit code 3 = some
   projects failed after the push (see the report), the others were packed: the job is allowed to fail with 3, so
   the upload still runs.
2. **`release:npm`** (GitLab-hosted, `RELEASE_PUBLISH_RUNNER_TAG`, default `saas-linux-small-amd64`): no checkout,
   no install; [`publish-tarballs.mjs`](tools/scripts/publish-tarballs.mjs) (copied into the artifact) runs
   `npm publish <tarball> --tag <dist-tag>` per package, packages group first, the `rxap` umbrella only when every
   member is on the registry. Versions that are already published are skipped, so **after a failure just retry
   this job**. Without a manifest (gate skipped, nothing to release) it ends at once.

| Pipeline | Trigger | What happens |
|---|---|---|
| `NX_RELEASE=nightly` | schedule on `development` (or Run pipeline) | gate, then `release.mjs --skip-validate [--stamped]` → `-dev.N` on dist-tag `development` |
| `NX_RELEASE=stable` | Run pipeline on `latest`, optional `RELEASE_SPECIFIER` (`minor`, `major`, exact) | `latest` := `development` (fast-forward), gate, `release.mjs --graduate --gitlab-release`, `development` := `latest` |
| `NX_RELEASE=publish-only` | Run pipeline on `development` / `latest` | checks out the newest release commit, `release.mjs --publish-only --rebuild --pack` (only when the artifact of the build job expired; otherwise retry `release:npm`; published versions are skipped) |

**Gate** (`release-ci.mjs`): the push pipeline of the newest non-release commit on `development` must be green
(running / red / missing → the nightly waits for the next night, the stable job fails), so the release skips its own
build/test/lint. Every package must already exist on npm. A framework stamp from a migration
(`FRAMEWORK-WATCH.md`, package major on disk > newest tag) adds `--stamped` automatically. Whether anything is
releasable decides `release.mjs` itself (conventional commits since the last tag, before it builds anything).
`RELEASE_SPECIFIER=prerelease` on a nightly bumps every package (bootstrap below).
Check the decision locally: `node tools/scripts/release-ci.mjs nightly --dry-run`.

**npm trusted publishing:** only `release:npm` gets an OIDC ID token (`id_tokens: NPM_ID_TOKEN`, audience
`npm:registry.npmjs.org`); npm (pinned `npm@11.21.2`) exchanges it per package for a short-lived token and attaches
provenance (public project). The trusted publisher of each package names project `rxap/packages`, file
`.gitlab-ci.yml` and environment `npm`. npm only accepts it from **GitLab.com hosted runners**, which is why the
build runs on our runners and only the upload (a few seconds per package) runs hosted. `release:npm` refuses to run
when an npm token is configured.

**New package:** trusted publishing cannot create a package (the nightly fails and names it). Publish its first
version by hand (`pnpm release --projects=<project>` with your npm login and 2FA), then
`node tools/scripts/npm-trust.mjs configure --from <npm name>` (for that one package: stop after it) and let the
next nightly publish through CI.

### Activation (at the final push, together with `RENOVATE.md`, `FRAMEWORK-WATCH.md`, `AGENT-FIX.md`)

1. Project access token `release-bot` (role *Maintainer*, scopes `api` + `write_repository`, expiry date) → CI
   variable `RELEASE_GITLAB_TOKEN` (masked, hidden, **protected**: the release jobs only run on `development` and
   `latest`). Protected branches `development` and `latest`: allow the bot to push.
2. Protected environment `npm` (deployments: Maintainers + the bot) and GitLab.com hosted runners enabled for the
   project.
3. Trusted publishers, **on the same day as step 4** (a new configuration expires when nothing is published
   through it within 2 days): `npm login`, then `node tools/scripts/npm-trust.mjs configure` (`--dry-run` first;
   the first call asks for 2FA — tick "skip 2FA for 5 minutes", continue with `--from <name>` when the window
   ends), then `node tools/scripts/npm-trust.mjs check`.
4. Bootstrap: Run pipeline on `development` with `NX_RELEASE=nightly` and `RELEASE_SPECIFIER=prerelease` (every
   package gets its next `-dev.N`, so every trust configuration sees a publish). Packages that failed: recreate
   their configuration (`npm trust revoke`, `configure --from`) and retry `release:npm`.
5. Schedule `Nightly release`: daily 02:00, branch `development`, variable `NX_RELEASE=nightly`.
6. After the first green nightly: revoke the npm publish token of `~/.npmrc` on npmjs.com; then
   `node tools/scripts/npm-trust.mjs lock` ("require 2FA and disallow tokens" per package).
