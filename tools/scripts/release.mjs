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
 *   6. changelog + commit + tag (releaseChangelog — writes CHANGELOG.md, single commit; the
 *                              tags are created per project by this script, see tagReleases)
 *   7. production build → dist (docs + build; dist inherits version + packageGroup + CHANGELOG)
 *   8. dist transforms         (theme export, strip the `workspace` marker dep)
 *   9. publish                 (releasePublish — from dist/{projectRoot}, with dist-tag)
 *  10. GitLab releases         (custom — Nx 20.5.0 cannot create GitLab releases natively)
 *  11. rxap umbrella pass      (update-package-group → version → build → publish, group "rxap")
 *  12. push                    (git push --follow-tags)
 *  13. report                  (per-project failures of steps 6-12)
 *
 * Failure handling: once the release commit exists (step 6), a failure of a single project in
 * the tag, publish or GitLab release step does NOT abort the run. It is recorded, the remaining
 * projects are released, the commit + tags are always pushed, and a report is printed at the end
 * (exit code 1 if anything failed). Aborting there would leave the release commit and its tags
 * local only while packages are already on npm; after the next reset those tags are orphaned and
 * collide with the recomputed version on the following run
 * (`fatal: tag '@rxap/<pkg>@<version>' already exists`).
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
// set once the release commit exists — from then on an abort must still push commit + tags
let releaseCommitted = false;
const die = (msg) => {
  console.error(C.red(`✗ ${msg}`));
  if (releaseCommitted && !DRY_RUN) {
    releaseCommitted = false; // no recursion if the push itself fails
    console.error(C.yellow('  Pushing the release commit and tags before aborting so they are not orphaned.'));
    try {
      execSync('git push --follow-tags', { stdio: 'inherit', env: process.env });
    } catch {
      console.error(C.red('  git push --follow-tags failed — push the release commit and tags manually.'));
    }
    printReport();
  }
  process.exit(1);
};

// per-project failures after the release commit exists — reported at the end instead of aborting
const failures = [];
const fail = (phase, project, reason) => {
  failures.push({ phase, project, reason });
  console.error(C.red(`✗ [${phase}] ${project}: ${reason}`));
};

function printReport() {
  log('Release report');
  if (failures.length === 0) {
    ok('All steps succeeded.');
    return;
  }
  console.error(C.red(`✗ ${failures.length} failure(s):`));
  for (const { phase, project, reason } of failures) {
    console.error(C.red(`  - [${phase}] ${project}: ${reason}`));
  }
  if (failures.some((f) => f.phase === 'publish' || f.phase === 'tag')) {
    console.error(
      C.yellow(
        '  Fix the cause, then retry the failed publishes with `yarn release --publish-only` ' +
          '(already published versions are reported as failures by npm and can be ignored).',
      ),
    );
  }
}

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
        fail('gitlab-release', project, `${tagName}: ${res.status} ${await res.text()}`);
      } else {
        ok(`GitLab release created: ${tagName}`);
      }
    } catch (e) {
      fail('gitlab-release', project, `${tagName}: ${e?.message ?? e}`);
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
    if (!DRY_RUN) pushRelease();
    return;
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
    gitTag: false, // nx aborts on the first existing tag — tagReleases tags per project instead
    gitPush: false,
    dryRun: DRY_RUN,
    verbose: VERBOSE,
    firstRelease: FIRST_RELEASE,
  });
  releaseCommitted = !DRY_RUN;
  const untagged = tagReleases(changelogResult.projectChangelogs);

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
  // a project whose tag could not be created is not published: its version is ambiguous
  const publishable = changed.filter((p) => !untagged.includes(p));
  const packagesFailed = await publishGroup(releasePublish, 'packages', mode, publishable);

  // ---- 10. GitLab releases (custom) ----
  log('Create GitLab releases');
  await createGitLabReleases(changelogResult.projectChangelogs);

  // ---- 11. rxap umbrella pass ----
  if (SKIP_UMBRELLA) {
    warn('Skipping rxap umbrella pass (--skip-umbrella).');
  } else if (untagged.length > 0 || packagesFailed.length > 0) {
    // the umbrella packageGroup would pin member versions that are not on the registry
    fail('umbrella', 'rxap', 'skipped because member packages failed to tag or publish');
  } else {
    await releaseRxapUmbrella({ releaseVersion, releaseChangelog, releasePublish, mode });
  }

  // ---- 12. push commit + tags — always, so the release commit and its tags never stay local ----
  if (!DRY_RUN) pushRelease();
}

function pushRelease() {
  log('Push commit and tags');
  if (!run('git push --follow-tags', { allowFailure: true })) {
    fail('push', '(all)', 'git push --follow-tags failed — push the release commit and tags manually');
  }
}

// Create one annotated tag per released project (same format as nx). A failure only affects that
// project. Returns the projects that could not be tagged.
function tagReleases(projectChangelogs) {
  log('Tag release commit');
  const untagged = [];
  const head = capture('git rev-parse HEAD');
  for (const [project, { releaseVersion }] of Object.entries(projectChangelogs ?? {})) {
    const tag = releaseVersion?.gitTag;
    if (!tag) {
      continue;
    }
    if (DRY_RUN) {
      console.log(`  [dry-run] would tag ${tag}`);
      continue;
    }
    let existing = '';
    try {
      existing = capture(`git rev-parse --verify --quiet "refs/tags/${tag}^{commit}"`);
    } catch {
      // tag does not exist
    }
    if (existing === head) {
      ok(`Tag already on the release commit: ${tag}`);
      continue;
    }
    if (existing) {
      fail(
        'tag',
        project,
        `tag ${tag} already exists on ${existing.slice(0, 9)} (not this release commit) — ` +
          `left over from an earlier aborted release? Not published. ` +
          `Check \`git tag -d ${tag}\` / \`npm view @rxap/${project} versions\`.`,
      );
      untagged.push(project);
      continue;
    }
    try {
      execSync(`git tag --annotate "${tag}" --message "${tag}"`, { stdio: 'pipe' });
      ok(`Tagged ${tag}`);
    } catch (e) {
      fail('tag', project, `git tag ${tag} failed: ${e?.stderr?.toString().trim() || e?.message}`);
      untagged.push(project);
    }
  }
  return untagged;
}

// publish a release group from dist. nx runs every project's publish (no bail); failures are
// recorded for the final report instead of aborting. Returns the failed projects.
async function publishGroup(releasePublish, group, mode, projects) {
  log(`Publish (${group} group) → ${mode.registry} @${mode.distTag}`);
  if (projects && projects.length === 0) {
    warn(`No publishable projects in group "${group}".`);
    return [];
  }
  let result;
  try {
    result = await releasePublish({
      groups: projects ? undefined : [group],
      projects,
      tag: mode.distTag,
      registry: mode.registry,
      dryRun: DRY_RUN,
      verbose: VERBOSE,
      firstRelease: FIRST_RELEASE,
    });
  } catch (e) {
    fail('publish', `group ${group}`, e?.message ?? String(e));
    return projects ?? [group];
  }
  const failed = Object.entries(result ?? {})
    .filter(([, r]) => r?.code !== 0)
    .map(([p, r]) => {
      fail('publish', p, `nx-release-publish exited with code ${r?.code} (see the output above)`);
      return p;
    });
  const published = Object.keys(result ?? {}).length - failed.length;
  ok(`Published ${published} project(s) of group "${group}".`);
  return failed;
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
    gitTag: false,
    gitPush: false,
    dryRun: DRY_RUN,
    verbose: VERBOSE,
    firstRelease: FIRST_RELEASE,
  });
  if (tagReleases(changelogResult.projectChangelogs).length > 0) {
    return; // already reported by tagReleases
  }

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
  .then(() => {
    printReport();
    if (failures.length > 0) {
      process.exit(1);
    }
    ok(DRY_RUN ? 'Dry-run complete.' : 'Release complete.');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    if (failures.length > 0) {
      printReport();
    }
    die(`Release failed: ${e?.message ?? e}`);
  });
