#!/usr/bin/env node
/**
 * RxAP release orchestrator — replaces the former Lerna + bash hook pipeline.
 *
 * Drives `nx release` (Nx 20.5.0) via its programmatic API and interleaves the custom
 * pre-steps that have no native equivalent. Run via `yarn release` (which wraps this in
 * `env-cmd` so `.env` provides GL_TOKEN / GITLAB_HOST).
 *
 * Phase order (the only correct order on Nx 20.5.0 — there is no `manifestRootsToUpdate`,
 * so the production build is what stamps the bumped version into dist/{projectRoot}; every
 * source-package.json mutation MUST finish before the build):
 *
 *   1. compute release mode from the git branch (prerelease / preid / dist-tag)
 *   2. preflight gate          (allowBranch, fetch, behind, dirty, GL_TOKEN, confirm)
 *   3. validate                (build/test/lint)
 *   4. version (source)        (releaseVersion — bumps source package.json + pins ^deps)
 *   5. source mutations        (update-package-group, readme, lockfile)
 *   6. changelog + tag + commit (releaseChangelog — writes CHANGELOG.md, single commit, tags)
 *   7. production build → dist (docs + build; dist inherits version + packageGroup + CHANGELOG)
 *   8. dist transforms         (theme export, strip the `workspace` marker dep)
 *   9. publish                 (releasePublish — from dist/{projectRoot}, with dist-tag)
 *  10. GitLab releases         (custom — Nx 20.5.0 cannot create GitLab releases natively)
 *  11. rxap umbrella pass      (update-package-group → version → build → publish, group "rxap")
 *  12. push                    (git push --follow-tags)
 *
 * Flags:
 *   --dry-run         thread dryRun through nx; skip all git/publish/GitLab side effects
 *   --first-release   first migrated run (no prior matching tag to diff against)
 *   --verbose         verbose nx output
 *   --specifier=<x>   force an explicit version specifier (e.g. patch|minor|major or an exact
 *                     version) for the packages group — needed to graduate a prerelease line
 *                     to a stable release on `latest`/`master` (Nx keeps incrementing the
 *                     prerelease otherwise)
 *   --skip-validate   skip the build/test/lint gate
 *   --skip-build      skip the production build (use existing dist; pair with --publish-only)
 *   --publish-only    jump straight to publish (retry a failed publish without re-versioning)
 *   --skip-umbrella   skip the rxap umbrella pass
 * Env:
 *   YES=true          skip the interactive confirmation
 *   GL_TOKEN          GitLab token (required) — used for GitLab release creation
 *   GITLAB_HOST       GitLab base url (default https://gitlab.com)
 *   PUBLISH_REGISTRY  npm registry (default https://registry.npmjs.org)
 *   GIT_BRANCH        override the detected branch (also reads CI_COMMIT_REF_NAME)
 */

import { execSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// flags / colors
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const valueOf = (name) => {
  const pref = `--${name}=`;
  const hit = argv.find((a) => a.startsWith(pref));
  return hit ? hit.slice(pref.length) : undefined;
};

const DRY_RUN = has('--dry-run');
const FIRST_RELEASE = has('--first-release');
const VERBOSE = has('--verbose');
const SKIP_VALIDATE = has('--skip-validate');
const SKIP_BUILD = has('--skip-build') || has('--publish-only');
const PUBLISH_ONLY = has('--publish-only');
const SKIP_UMBRELLA = has('--skip-umbrella');
const FORCED_SPECIFIER = valueOf('specifier');

const C = {
  red: (s) => `\x1b[0;31m${s}\x1b[0m`,
  green: (s) => `\x1b[0;32m${s}\x1b[0m`,
  blue: (s) => `\x1b[0;34m${s}\x1b[0m`,
  yellow: (s) => `\x1b[0;33m${s}\x1b[0m`,
};
const log = (msg) => console.log(C.blue(`\n▶ ${msg}`));
const ok = (msg) => console.log(C.green(`✔ ${msg}`));
const warn = (msg) => console.warn(C.yellow(`⚠ ${msg}`));
const die = (msg) => {
  console.error(C.red(`✗ ${msg}`));
  process.exit(1);
};

// ---------------------------------------------------------------------------
// shell helpers
// ---------------------------------------------------------------------------
function run(cmd, { allowFailure = false } = {}) {
  console.log(C.blue(`  $ ${cmd}`));
  try {
    execSync(cmd, { stdio: 'inherit', env: process.env });
  } catch (e) {
    if (allowFailure) {
      warn(`command failed (continuing): ${cmd}`);
      return false;
    }
    die(`command failed: ${cmd}`);
  }
  return true;
}
function capture(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).toString().trim();
}

// ---------------------------------------------------------------------------
// 1. compute release mode from branch (ported verbatim from the old
//    tools/scripts/lerna/{version,publish}.sh logic)
// ---------------------------------------------------------------------------
function computeReleaseMode() {
  const branch =
    process.env.GIT_BRANCH ||
    process.env.CI_COMMIT_REF_NAME ||
    capture('git branch --show-current');
  const defaultBranch = process.env.GIT_DEFAULT_BRANCH || 'development';

  const PRE = ['next', 'next-major', 'beta', 'alpha'];
  let isPrerelease = null;
  let distTag = '';
  let preid = '';

  // sequential (not exclusive) — later matches override earlier ones, matching publish.sh
  if (PRE.includes(branch)) {
    isPrerelease = true;
    distTag = branch;
    preid = branch;
  }
  if (branch === defaultBranch || branch === 'latest' || branch === 'master') {
    isPrerelease = false;
    distTag = 'latest';
  }
  if (/^[0-9]+\.x/.test(branch)) {
    isPrerelease = false;
    distTag = branch;
  }
  if (/^[0-9]+\.[0-9]+\.x/.test(branch)) {
    isPrerelease = false;
    distTag = branch;
  }
  if (/-dev$/.test(branch) || branch === 'development') {
    isPrerelease = true;
    distTag = branch;
    preid = 'dev';
  }

  const registry = process.env.PUBLISH_REGISTRY || 'https://registry.npmjs.org';
  return { branch, defaultBranch, isPrerelease, distTag, preid, registry };
}

// allowBranch guard — mirrors lerna.json `command.version.allowBranch`
function isAllowedBranch(branch) {
  const literals = [
    'development',
    'latest',
    'next',
    'next-major',
    'beta',
    'alpha',
    'master',
  ];
  if (literals.includes(branch)) return true;
  // N.x.x / N.M.x (+ optional -dev), matching the lerna allowBranch globs
  return /^[0-9]+\.(x|[0-9]+)(\.x)?(-dev)?$/.test(branch);
}

// ---------------------------------------------------------------------------
// 2. preflight
// ---------------------------------------------------------------------------
async function preflight(mode) {
  log('Preflight checks');

  if (!isAllowedBranch(mode.branch)) {
    die(
      `Branch "${mode.branch}" is not a release branch. Allowed: development, latest, next, ` +
        `next-major, beta, alpha, master, N.x[.x], N.M.x (optionally -dev).`,
    );
  }
  if (mode.isPrerelease === null) {
    die(`Could not resolve a release mode for branch "${mode.branch}".`);
  }

  run('git fetch');
  const behind = capture(
    `git rev-list HEAD...origin/${mode.branch} --left-right 2>/dev/null | grep -c '^>' || true`,
  );
  if (Number(behind) > 0) {
    die(`Local branch is behind origin/${mode.branch} by ${behind} commits.`);
  }
  ok('Local branch is up-to-date with remote.');

  // working tree must be clean (publish-only re-runs may have a dirty dist, but dist is gitignored)
  const dirty = capture('git status --porcelain');
  if (dirty) {
    die('Working tree has uncommitted changes. Commit or stash before releasing.');
  }

  if (!process.env.GL_TOKEN) {
    die('GL_TOKEN is not set (required for GitLab release creation).');
  }
  // Nx GitHub integration reads GITHUB_TOKEN; our custom GitLab step reads GL_TOKEN directly.

  console.log(
    [
      `  branch          = ${mode.branch}`,
      `  prerelease      = ${mode.isPrerelease}`,
      `  preid           = ${mode.preid || '(none)'}`,
      `  dist-tag        = ${mode.distTag}`,
      `  registry        = ${mode.registry}`,
      `  specifier       = ${FORCED_SPECIFIER || '(conventional-commits)'}`,
      `  dry-run         = ${DRY_RUN}`,
      `  first-release   = ${FIRST_RELEASE}`,
    ].join('\n'),
  );

  if (process.env.YES !== 'true' && !DRY_RUN) {
    const rl = createInterface({ input, output });
    const answer = await rl.question('Are you sure? [y/N] ');
    rl.close();
    if (!/^y(es)?$/i.test(answer.trim())) {
      console.log('Aborted.');
      process.exit(0);
    }
  }
}

// ---------------------------------------------------------------------------
// GitLab release creation (custom — Nx 20.5.0 only supports GitHub natively)
// ---------------------------------------------------------------------------
function gitlabProjectPath() {
  const remote = capture('git remote get-url origin');
  // git@gitlab.com:rxap/packages.git  |  https://gitlab.com/rxap/packages.git
  const m = remote.match(/[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
  if (!m) die(`Could not parse GitLab project path from remote "${remote}"`);
  return m[1];
}

async function createGitLabReleases(projectChangelogs) {
  if (!projectChangelogs || Object.keys(projectChangelogs).length === 0) {
    warn('No project changelogs returned; skipping GitLab release creation.');
    return;
  }
  const base = (process.env.CI_API_V4_URL || `${process.env.GITLAB_HOST || 'https://gitlab.com'}/api/v4`).replace(/\/$/, '');
  const projectId = process.env.CI_PROJECT_ID || encodeURIComponent(gitlabProjectPath());
  const url = `${base}/projects/${projectId}/releases`;

  for (const [project, { releaseVersion, contents }] of Object.entries(projectChangelogs)) {
    const tagName = releaseVersion?.gitTag;
    if (!tagName) {
      warn(`No git tag for "${project}"; skipping its GitLab release.`);
      continue;
    }
    if (DRY_RUN) {
      console.log(`  [dry-run] would create GitLab release ${tagName}`);
      continue;
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'PRIVATE-TOKEN': process.env.GL_TOKEN,
        },
        body: JSON.stringify({
          tag_name: tagName,
          name: tagName,
          description: contents || `Release ${tagName}`,
        }),
      });
      if (!res.ok) {
        warn(`GitLab release ${tagName} failed: ${res.status} ${await res.text()}`);
      } else {
        ok(`GitLab release created: ${tagName}`);
      }
    } catch (e) {
      warn(`GitLab release ${tagName} errored: ${e?.message ?? e}`);
    }
  }
}

// ---------------------------------------------------------------------------
// load the nx/release programmatic API
// nx is CJS with no `exports` map, so an ESM `import('nx/release')` hits
// ERR_UNSUPPORTED_DIR_IMPORT — use createRequire for CJS directory resolution.
// ---------------------------------------------------------------------------
function loadNxRelease() {
  const api = require('nx/release');
  if (!api?.releaseVersion || !api?.releaseChangelog || !api?.releasePublish) {
    die('Could not load releaseVersion/releaseChangelog/releasePublish from "nx/release".');
  }
  return api;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  // run from the workspace root regardless of invocation cwd
  process.chdir(capture('git rev-parse --show-toplevel'));

  const mode = computeReleaseMode();
  await preflight(mode);
  process.env.GITLAB_TOKEN = process.env.GITLAB_TOKEN || process.env.GL_TOKEN;

  const { releaseVersion, releaseChangelog, releasePublish } = loadNxRelease();

  // ---- fast path: retry just the publish from existing dist ----
  if (PUBLISH_ONLY) {
    log('Publish-only: publishing existing dist');
    await publishGroup(releasePublish, 'packages', mode);
    if (!SKIP_UMBRELLA) await publishGroup(releasePublish, 'rxap', mode);
    if (!DRY_RUN) run('git push --follow-tags');
    return ok('Publish-only run complete.');
  }

  if (DRY_RUN) {
    warn(
      'Dry-run: skipping validate, source mutations, build and dist transforms; ' +
        'previewing version, changelog and publish only. Re-run without --dry-run to release.',
    );
  }

  // ---- 3. validate ----
  if (!DRY_RUN && !SKIP_VALIDATE) {
    log('Validate (build, test, lint)');
    run('yarn nx reset');
    run('yarn nx run-many --targets=build,test,lint --exclude=angular');
  } else if (SKIP_VALIDATE) {
    warn('Skipping validation gate (--skip-validate).');
  }

  // ---- 4. version the `packages` group (source package.json) ----
  log('Version (packages group)');
  const versionResult = await releaseVersion({
    groups: ['packages'],
    specifier: FORCED_SPECIFIER,
    preid: mode.isPrerelease ? mode.preid : undefined,
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    dryRun: DRY_RUN,
    verbose: VERBOSE,
    firstRelease: FIRST_RELEASE,
  });
  const versionData = versionResult.projectsVersionData ?? {};
  const changed = Object.entries(versionData)
    .filter(([, d]) => d?.newVersion)
    .map(([p]) => p);

  if (changed.length === 0) {
    return ok('No package version changes detected. Nothing to release.');
  }
  console.log(`  Changed projects (${changed.length}): ${changed.join(', ')}`);

  // ---- 5. source mutations that must precede the build ----
  if (!DRY_RUN) {
    log('Regenerate package groups + README + lockfile (source)');
    run('yarn nx reset');
    // update-package-group pulls in update-dependencies via its dependsOn (belt-and-suspenders
    // for the internal ^dep pinning that updateDependents/versionPrefix already handles)
    run('yarn nx run-many --targets=update-package-group --exclude=rxap');
    run('yarn nx reset');
    run('yarn nx run workspace:readme');
    run('yarn install --mode=update-lockfile', { allowFailure: true });
  }

  // ---- 6. changelog + single release commit + tags ----
  log('Changelog + commit + tag (packages group)');
  if (!DRY_RUN) run('git add -A'); // stage version + packageGroup + readme + lockfile changes
  const changelogResult = await releaseChangelog({
    groups: ['packages'],
    versionData,
    version: versionResult.workspaceVersion,
    createRelease: false, // Nx 20.5.0 cannot create GitLab releases — handled below
    gitCommit: true, // commits ALL staged files (nx `git commit` is not pathspec-limited)
    gitCommitMessage: 'chore(release): version',
    stageChanges: true,
    gitTag: true,
    gitPush: false,
    dryRun: DRY_RUN,
    verbose: VERBOSE,
    firstRelease: FIRST_RELEASE,
  });

  // ---- 7. production build → dist (carries bumped version + packageGroup + CHANGELOG) ----
  if (!DRY_RUN && !SKIP_BUILD) {
    log('Production build → dist');
    const projects = changed.join(',');
    run('yarn nx reset');
    run(`yarn nx run-many --targets=readme --projects=${projects} --exclude=angular --skip-nx-cache --nxBail`);
    run(`yarn nx run-many --targets=compodoc --projects=${projects} --exclude=angular,workspace --skip-nx-cache --nxBail`);
    run(`yarn nx run-many --targets=typedoc --projects=${projects} --exclude=angular,workspace --skip-nx-cache --nxBail`);
    run(`yarn nx run-many --targets=build --configuration=production --projects=${projects} --exclude=angular --skip-nx-cache --nxBail`);
  } else if (SKIP_BUILD) {
    warn('Skipping production build (--skip-build).');
  }

  // ---- 8. dist transforms (former prepack) ----
  if (!DRY_RUN) {
    log('Dist transforms (theme export, strip workspace marker)');
    run('bash tools/scripts/add-theme-entry-point-to-package-json.sh');
    run('bash tools/scripts/remove-blacklisted-package-dependenceis.sh');
  }

  // ---- 9. publish the `packages` group from dist ----
  await publishGroup(releasePublish, 'packages', mode);

  // ---- 10. GitLab releases (custom) ----
  log('Create GitLab releases');
  await createGitLabReleases(changelogResult.projectChangelogs);

  // ---- 11. rxap umbrella pass ----
  if (!SKIP_UMBRELLA) {
    await releaseRxapUmbrella({ releaseVersion, releaseChangelog, releasePublish, mode });
  } else {
    warn('Skipping rxap umbrella pass (--skip-umbrella).');
  }

  // ---- 12. push commit + tags ----
  log('Push commit and tags');
  if (!DRY_RUN) run('git push --follow-tags');

  ok('Release complete.');
}

// publish a release group from dist and abort on any per-project failure
async function publishGroup(releasePublish, group, mode) {
  log(`Publish (${group} group) → ${mode.registry} @${mode.distTag}`);
  const result = await releasePublish({
    groups: [group],
    tag: mode.distTag,
    registry: mode.registry,
    dryRun: DRY_RUN,
    verbose: VERBOSE,
    firstRelease: FIRST_RELEASE,
  });
  const failed = Object.entries(result ?? {}).filter(([, r]) => r?.code !== 0);
  if (failed.length > 0) {
    die(
      `Publish failed for ${failed.length} project(s) in group "${group}": ` +
        failed.map(([p, r]) => `${p}(code ${r.code})`).join(', ') +
        `. Re-run with --publish-only after fixing.`,
    );
  }
  ok(`Published group "${group}".`);
}

// rxap umbrella: regenerate its packageGroup against finalized member versions, then
// version + changelog + build + publish it as its own group (matches the old 2nd-pass behavior)
async function releaseRxapUmbrella({ releaseVersion, releaseChangelog, releasePublish, mode }) {
  log('rxap umbrella pass');

  // recompute the umbrella packageGroup from the just-published member versions
  if (!DRY_RUN) {
    run('yarn nx reset');
    run('yarn nx run rxap:update-package-group --skip-nx-cache');
    // conventional commit so the umbrella gets a patch (or prerelease) bump
    run('git add -A', { allowFailure: true });
    run('git commit -m "fix(rxap): update package group" --no-verify', { allowFailure: true });
  }

  const versionResult = await releaseVersion({
    groups: ['rxap'],
    preid: mode.isPrerelease ? mode.preid : undefined,
    specifier: FORCED_SPECIFIER,
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    dryRun: DRY_RUN,
    verbose: VERBOSE,
    firstRelease: FIRST_RELEASE,
  });
  const versionData = versionResult.projectsVersionData ?? {};
  if (!Object.values(versionData).some((d) => d?.newVersion)) {
    return warn('rxap umbrella has no version change; skipping umbrella publish.');
  }

  if (!DRY_RUN) run('git add -A');
  const changelogResult = await releaseChangelog({
    groups: ['rxap'],
    versionData,
    version: versionResult.workspaceVersion,
    createRelease: false,
    gitCommit: true,
    gitCommitMessage: 'chore(release): version rxap',
    stageChanges: true,
    gitTag: true,
    gitPush: false,
    dryRun: DRY_RUN,
    verbose: VERBOSE,
    firstRelease: FIRST_RELEASE,
  });

  if (!DRY_RUN && !SKIP_BUILD) {
    run('yarn nx reset');
    run('yarn nx run rxap:build');
  }

  await publishGroup(releasePublish, 'rxap', mode);
  await createGitLabReleases(changelogResult.projectChangelogs);
}

main()
  // Exit explicitly: the nx/release programmatic API leaves the Nx daemon
  // socket connection open, which keeps the event loop alive and would
  // otherwise hang the process after all work is done.
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    die(`Release failed: ${e?.message ?? e}`);
  });
