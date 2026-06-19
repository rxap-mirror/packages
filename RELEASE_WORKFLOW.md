# Release Workflow

Releases are driven by **`nx release`** (Nx 20.5.0) through the orchestrator at
[`tools/scripts/release.mjs`](tools/scripts/release.mjs). This replaced the former Lerna +
bash-hook pipeline; the orchestrator preserves every pre-step that pipeline performed.

## Prerequisites

- `.env` must exist with `GL_TOKEN=<your-gitlab-token>` set (used to create GitLab releases).
  Optionally set `GITLAB_HOST` (defaults to `https://gitlab.com`).
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

### Useful flags

- `--dry-run` – thread dry-run through nx; skip all git/publish/GitLab side effects.
- `--first-release` – required for the very first migrated run (no prior matching tag to diff).
- `--specifier=<x>` – force the version bump for the `packages` group (graduation).
- `--publish-only` – retry just the publish from the existing `dist/` (e.g. after a partial
  publish failure) without re-versioning.
- `--skip-validate` / `--skip-build` / `--skip-umbrella` – skip individual phases.
- `YES=true yarn release` – skip the interactive confirmation.

## What the orchestrator does (phase order)

1. **Compute release mode** from the branch (prerelease / preid / dist-tag).
2. **Preflight** – allowBranch guard, `git fetch`, behind/dirty checks, `GL_TOKEN`, confirm.
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
   internal `workspace` marker dependency.
9. **Publish** – `releasePublish` from `dist/{projectRoot}` with the branch dist-tag/registry.
10. **GitLab releases** – created via the GitLab Releases API (Nx 20.5.0 has no native GitLab
    support), one per published project, using the generated changelog as the body.
11. **rxap umbrella** – regenerate the `rxap` meta-package's package group against the finalized
    member versions, then version/changelog/build/publish it as its own release group.
12. **Push** – `git push --follow-tags`.

## Configuration

Release behavior is configured under `release` in [`nx.json`](nx.json): two independent release
groups (`packages` for the `tag:packages` libraries, `rxap` for the umbrella), conventional-commit
versioning with the `git-tag` current-version resolver (`disk` fallback for packages without a
matching tag yet), `^` version prefix, per-project changelogs, and
`nx-release-publish.packageRoot = dist/{projectRoot}` (publish from dist) in `targetDefaults`.

> Tags use `@rxap/{projectName}@{version}` (and `rxap@{version}` for the umbrella). Where an Nx
> project name differs from its published package name (e.g. project `angular-environment` →
> `@rxap/environment`), the existing tag won't match and the current version is read from disk;
> Nx then creates a new-scheme tag going forward. **Run the first migrated release with
> `--first-release`** so changelog generation doesn't require a prior matching tag.
