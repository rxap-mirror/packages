# Release Workflow

Releases are driven by **`nx release`** (Nx 22.x) through the orchestrator at
[`tools/scripts/release.mjs`](tools/scripts/release.mjs). This replaced the former Lerna +
bash-hook pipeline; the orchestrator preserves every pre-step that pipeline performed.

## Prerequisites

- Only for `--gitlab-release`: the [`glab`](https://gitlab.com/gitlab-org/cli) CLI must be installed
  and authenticated (`glab auth login`). No token in `.env` is needed.
- You must be on a release branch: `development`, `latest`, `next`, `next-major`, `beta`,
  `alpha`, `master`, or a maintenance branch `N.x[.x]` / `N.M.x` (optionally `-dev`).
- The working tree must be clean and up-to-date with the remote.

## Run a release

```shell
# preview everything without writing/publishing anything
yarn release:dry

# perform the release for the current branch
yarn release
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
`yarn release --specifier=patch` (or `minor` / `major` / an exact version).

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
  publish failure) without re-versioning.
- `--skip-validate` / `--skip-build` / `--skip-umbrella` – skip individual phases.
- `YES=true yarn release` – skip the interactive confirmation.
- `--projects=<a,b>` – release only these projects: dependents are not bumped and the `rxap` umbrella
  pass is skipped. Also limits `--publish-only`.
- `--final` – (requires `--projects`) stable release of the selection on any release branch (dist-tag
  `latest`, `24.0.0-dev.1` → `24.0.0`), while the rest of the workspace stays on its prerelease line.

### Sunsetting a package

1. Add it to `tools/scripts/sunset-packages.json` (message, `finalRelease`) and prefix its
   `package.json` description with `DEPRECATED — <message>` (the README is generated from it).
2. Final stable release: ``yarn release --final --projects=$(node tools/scripts/deprecate-packages.mjs projects)``
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
yarn nx run workspace:e2e-pm                       # full matrix, ~15 min with a warm Nx cache
yarn nx run workspace:e2e-pm --pm=pnpm --keep      # one package manager, keep the temp workspace
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
9. **Publish** – `releasePublish` from `dist/{projectRoot}` with the branch dist-tag/registry.
10. **GitLab releases** – created via the GitLab Releases API (Nx 20.5.0 has no native GitLab
    support), one per published project, using the generated changelog as the body.
11. **rxap umbrella** – regenerate the `rxap` meta-package's package group against the finalized
    member versions, then version/changelog/build/publish it as its own release group.
12. **Push** – `git push --follow-tags`.

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
