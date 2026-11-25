#!/usr/bin/env node
/**
 * RxAP release orchestrator — replaces the former Lerna + bash hook pipeline.
 *
 * Drives `nx release` (Nx 20.5.0) via its programmatic API and interleaves the custom
 * pre-steps that have no native equivalent. Run via `pnpm release` (which wraps this in
 * `env-cmd` so `.env` is loaded).
 *
 * Phase order (the only correct order on Nx 20.5.0 — there is no `manifestRootsToUpdate`,
 * so the production build is what stamps the bumped version into dist/{projectRoot}; every
 * source-package.json mutation MUST finish before the build):
 *
 *   1. compute release mode from the git branch (prerelease / preid / dist-tag)
 *   2. preflight gate          (allowBranch, fetch, behind, dirty, glab, confirm)
 *   3. validate                (build/test/lint)
 *   4. version (source)        (releaseVersion — bumps source package.json + pins ^deps)
 *   5. source mutations        (update-package-group, readme, lockfile)
 *   6. changelog + commit      (releaseChangelog — writes CHANGELOG.md, single LOCAL commit; NO tags yet)
 *   7. production build → dist (docs + build; dist inherits version + packageGroup + CHANGELOG)
 *   8. dist transforms         (theme export, strip the `workspace` marker dep, strip ng-prism + guard)
 *   8b. tag                    (tagReleases — one annotated tag per project, ONLY after the dist passed
 *                              every check, so a failed build/guard never leaves tags behind)
 *   8c. push                   (release commit + exactly this run's tags, one atomic push to
 *                              origin/<branch>, push option `ci.skip`) — BEFORE anything is published
 *   9. publish                 (releasePublish — from dist/{projectRoot}, with dist-tag)
 *  10. GitLab releases         (opt-in via --gitlab-release; REST API in CI, the `glab` CLI locally)
 *  11. rxap umbrella pass      (update-package-group → version → build → push → publish, group "rxap")
 *  12. report                  (per-project failures of steps 8b-11)
 *
 * Failure handling: any abort before the push (changelog, build, dist transforms, ng-prism guard, a
 * rejected push because the branch moved) leaves the release commit and its tags local and NOTHING is
 * published; reset with `git reset --hard origin/<branch>` (+ delete the printed tags) and run again.
 * After the push, a failure of a single project in the publish or GitLab release step does NOT abort the
 * run: it is recorded, the remaining projects are released and a report is printed at the end (exit code 1).
 * Retry failed publishes with `--publish-only` (`--rebuild` in CI, where no dist exists): the tags are
 * already on the remote, so a published version never lacks its tag.
 *
 * Flags:
 *   --dry-run         thread dryRun through nx; skip all git/publish/GitLab side effects
 *   --first-release   first migrated run (no prior matching tag to diff against)
 *   --verbose         verbose nx output
 *   --specifier=<x>   force an explicit version specifier (e.g. patch|minor|major or an exact
 *                     version) for the packages group — needed to graduate a prerelease line
 *                     to a stable release on `latest`/`master` (Nx keeps incrementing the
 *                     prerelease otherwise)
 *   --graduate[=<preid>]
 *                     promote the current prerelease line (preid default `dev`) to a stable release
 *                     on a stable branch (`latest`/`master`); implies `--specifier=patch`
 *   --stamped         first release after a framework upgrade: every project whose on-disk version has a
 *                     HIGHER MAJOR than its newest git tag (e.g. angular 21.0.1 -> stamped 22.0.0, nest
 *                     11.0.2 -> 12.0.0, plugins 22.0.1 -> 24.0.0) is released at exactly the stamped
 *                     version (`<disk>-<preid>.0` on a prerelease branch, `<disk>` on a stable one).
 *                     Needed because `currentVersionResolver: git-tag` ignores the stamp and Nx would
 *                     otherwise bump from the old tag (or find no feat/fix commit and release nothing).
 *                     All other projects keep the conventional-commits bump. Dry-run it first.
 *   --projects=<a,b>  release only these projects (Nx project names): validate, version, build, dist
 *                     checks, tags and publish are limited to them, dependents are NOT bumped
 *                     (updateDependents 'never') and the rxap umbrella pass is skipped. Not combinable
 *                     with --stamped.
 *   --final           stable release of the selected --projects on ANY release branch (dist-tag
 *                     `latest`, prerelease suffix dropped: 24.0.0-dev.1 -> 24.0.0). Meant for the last
 *                     release of a package before it is deprecated and deleted, while the rest of the
 *                     workspace stays on its prerelease line. Requires --projects; implies --graduate.
 *   --skip-validate   skip the build/test/lint gate
 *   --skip-build      skip the production build (use existing dist; pair with --publish-only)
 *   --publish-only    jump straight to publish (retry a failed publish without re-versioning); never pushes
 *   --rebuild         with --publish-only: rebuild the dist of the projects of the release commit(s) at HEAD
 *                     first (CI, fresh checkout); limited by --projects
 *   --skip-umbrella   skip the rxap umbrella pass
 *   --gitlab-release  also create a GitLab release per released project (via the `glab` CLI,
 *                     which must be installed and authenticated: `glab auth login`). Off by default.
 *   --gitlab-releases-only
 *                     implies --gitlab-release. Only (re)create the GitLab releases of the latest release run from the
 *                     existing tags + CHANGELOG.md files (existing releases are skipped); use it
 *                     after a failed gitlab-release step. `--commit=<sha>[,<sha>]` selects the
 *                     release commit(s) explicitly instead of the latest `chore(release): version*`
 * Env:
 *   YES=true          skip the interactive confirmation
 *   PUBLISH_REGISTRY  npm registry (default https://registry.npmjs.org)
 *   GIT_BRANCH        override the detected branch (also reads CI_COMMIT_REF_NAME)
 *   RELEASE_PUSH_OPTIONS  git push options of the release push, comma separated (default `ci.skip`, '' = none)
 *   RELEASE_GITLAB_TOKEN  (CI) GitLab releases through the REST API (with CI_API_V4_URL, CI_PROJECT_ID)
 *   CI                with it, a git identity (GIT_COMMITTER_EMAIL or git config user.email) is required
 */

import { execSync, spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { createRequire } from 'node:module';
import { applyDistTransforms } from './dist-transforms.mjs';
import { listReleaseProjects as listGroupProjects, pushArgs, stampedPlan as planStamped } from './lib/release-plan.mjs';

const require = createRequire(import.meta.url);

// The release must run unattended (CI, piped output): the Nx TUI takes over the terminal and stays
// open after the tasks finish. Every nx child process inherits process.env, so this covers them all.
// Export NX_TUI=true to opt back in locally.
process.env.NX_TUI ??= 'false';

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
// --rebuild (with --publish-only): rebuild the dist of the release commit(s) at HEAD first (CI has no dist)
const REBUILD = has('--rebuild');
// git push options of the release push (default `ci.skip`: no pipelines for the release commit and its tags)
const PUSH_OPTIONS = (process.env.RELEASE_PUSH_OPTIONS ?? 'ci.skip').split(',').map((o) => o.trim()).filter(Boolean);
const SKIP_UMBRELLA = has('--skip-umbrella') || valueOf('projects') !== undefined;
const GITLAB_ONLY = has('--gitlab-releases-only');
const GITLAB_RELEASE = has('--gitlab-release') || GITLAB_ONLY;
// --graduate[=<preid>]: promote the latest prerelease line (default preid `dev`) to a stable release.
// Nx resolves the current version from the newest *stable* tag unless it is told the preid, which
// would restart the stable line at the old version (e.g. 19.1.2 -> 19.1.3 instead of 21.0.1-dev.1 -> 21.0.1).
const STAMPED = has('--stamped');
// --projects=<a,b>: restrict the release to these projects (no dependents, no umbrella)
const PROJECTS = valueOf('projects')?.split(',').map((p) => p.trim()).filter(Boolean);
// --final: stable release of the selected projects on any release branch (see the header)
const FINAL = has('--final');
const GRADUATE = valueOf('graduate') ?? (has('--graduate') || FINAL ? 'dev' : undefined);
// graduating means dropping the prerelease suffix: `patch` on `x.y.z-dev.n` yields `x.y.z`
const FORCED_SPECIFIER = valueOf('specifier') ?? (GRADUATE ? 'patch' : undefined);

const C = {
  red: (s) => `\x1b[0;31m${s}\x1b[0m`,
  green: (s) => `\x1b[0;32m${s}\x1b[0m`,
  blue: (s) => `\x1b[0;34m${s}\x1b[0m`,
  yellow: (s) => `\x1b[0;33m${s}\x1b[0m`,
};
const log = (msg) => console.log(C.blue(`\n▶ ${msg}`));
const ok = (msg) => console.log(C.green(`✔ ${msg}`));
const warn = (msg) => console.warn(C.yellow(`⚠ ${msg}`));
// set once a release commit exists locally but is not pushed yet — an abort leaves it (and its tags) local,
// nothing was published (the push always precedes the publish)
let unpushedRelease = false;
// the branch being released (for the abort hint)
let releaseBranch;
// the tags created by this run (pushed together with the release commit)
const createdTags = [];
const die = (msg) => {
  console.error(C.red(`✗ ${msg}`));
  if (unpushedRelease && !DRY_RUN) {
    const tags = createdTags.map((t) => `"${t}"`).join(' ');
    console.error(
      C.yellow(
        '  Aborted before the push: nothing of this release was published or pushed.\n' +
          '  The release commit is still local. Fix the cause and run the release again after\n' +
          `  \`git reset --hard origin/${releaseBranch}\`` + (tags ? ` and \`git tag -d ${tags}\`` : '') + '.',
      ),
    );
  }
  if (failures.length > 0) printReport();
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
        '  Fix the cause, then retry the failed publishes with `pnpm release --publish-only` ' +
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

  if (FINAL && isPrerelease !== null) {
    // the selected projects leave the branch's prerelease line for good
    isPrerelease = false;
    distTag = 'latest';
    preid = '';
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
  if (FINAL && !PROJECTS?.length) {
    die('--final requires --projects=<a,b,...>: it must never turn the whole workspace stable.');
  }
  if (PROJECTS !== undefined && PROJECTS.length === 0) {
    die('--projects is empty.');
  }
  if (PROJECTS && STAMPED) {
    die('--projects cannot be combined with --stamped.');
  }
  if (PROJECTS) {
    const known = new Set(listReleaseProjects('packages').map((p) => p.name));
    const unknown = PROJECTS.filter((p) => !known.has(p));
    if (unknown.length > 0) {
      die(`--projects contains projects that are not in the "packages" release group: ${unknown.join(', ')}`);
    }
  }

  // CI: commits need an identity (GIT_AUTHOR_*/GIT_COMMITTER_* from the job or git config)
  if (process.env.CI && !DRY_RUN && !PUBLISH_ONLY && !GITLAB_ONLY) {
    const email = process.env.GIT_COMMITTER_EMAIL || spawnSync('git', ['config', 'user.email'], { encoding: 'utf-8' }).stdout.trim();
    if (!email) die('No git identity: set GIT_AUTHOR_NAME/EMAIL and GIT_COMMITTER_NAME/EMAIL (or git config user.*).');
  }

  run('git fetch');
  // --publish-only never pushes and may run on an older release commit: the behind check does not apply
  const behind = PUBLISH_ONLY ? '0' : capture(
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

  if (GITLAB_RELEASE && !gitlabApi()) {
    const auth = spawnSync('glab', ['auth', 'status'], { encoding: 'utf-8' });
    if (auth.error?.code === 'ENOENT') {
      die('--gitlab-release requires the `glab` CLI, which was not found in PATH.');
    }
    if (auth.status !== 0) {
      die('`glab auth status` failed — run `glab auth login` (required by --gitlab-release).');
    }
  }

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
      `  graduate        = ${GRADUATE ?? false}`,
      `  stamped         = ${STAMPED}`,
      `  final           = ${FINAL}`,
      `  projects        = ${PROJECTS?.join(', ') ?? '(all changed)'}`,
      `  gitlab-release  = ${GITLAB_RELEASE}`,
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
// GitLab release creation (custom — Nx 20.5.0 only supports GitHub natively; opt-in, uses glab)
// ---------------------------------------------------------------------------
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Create one GitLab release through the `glab` CLI (`glab api` resolves the host, project and
// credentials from the git remote and `glab auth login`; arguments are passed without a shell).
// Retries rate limits (429), 5xx and network errors with exponential backoff; an already
// existing release (409) counts as success.
// CI: the GitLab REST API with RELEASE_GITLAB_TOKEN (no glab in the image); null on the laptop
function gitlabApi() {
  const { CI_API_V4_URL: api, CI_PROJECT_ID: project, RELEASE_GITLAB_TOKEN: token } = process.env;
  return api && project && token ? { url: `${api}/projects/${encodeURIComponent(project)}/releases`, token } : null;
}

// one POST through fetch; errors carry "(HTTP nnn)" like glab's, for the shared retry logic
async function postGitLabReleaseRest({ url, token }, tagName, description) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'PRIVATE-TOKEN': token, 'content-type': 'application/json' },
      body: JSON.stringify({ tag_name: tagName, name: tagName, description }),
    });
    if (res.ok) return { ok: true };
    return { ok: false, text: `(HTTP ${res.status}) ${(await res.text()).slice(0, 300)}` };
  } catch (e) {
    return { ok: false, text: String(e?.message ?? e) };
  }
}

async function postGitLabRelease(tagName, description) {
  const MAX_ATTEMPTS = 6;
  const rest = gitlabApi();
  let lastError = '';
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const wait = Math.min(2000 * 2 ** (attempt - 1), 60000);
    if (rest) {
      const r = await postGitLabReleaseRest(rest, tagName, description);
      if (r.ok) return { ok: true };
      lastError = r.text;
    }
    const res = rest ? null : spawnSync(
      'glab',
      [
        'api', '--method', 'POST', 'projects/:id/releases',
        '-f', `tag_name=${tagName}`,
        '-f', `name=${tagName}`,
        '-f', `description=${description}`,
      ],
      { encoding: 'utf-8', maxBuffer: 16 * 1024 * 1024 },
    );
    if (res) {
      if (res.status === 0) return { ok: true };
      lastError = (res.error?.message ?? `${res.stderr}${res.stdout}`).trim();
    }
    const status = Number(lastError.match(/\(HTTP (\d{3})\)/)?.[1]);
    if (status === 409) return { ok: true, existed: true };
    if (status && status !== 429 && status < 500) break; // not retryable
    if (attempt < MAX_ATTEMPTS) {
      warn(`GitLab release ${tagName}: ${lastError.slice(0, 120)} — retry ${attempt}/${MAX_ATTEMPTS - 1} in ${Math.round(wait / 1000)}s`);
      await sleep(wait);
    }
  }
  return { ok: false, error: lastError };
}

async function createGitLabReleases(projectChangelogs) {
  if (!GITLAB_RELEASE) {
    console.log('  GitLab releases are skipped (pass --gitlab-release to create them).');
    return;
  }
  if (!projectChangelogs || Object.keys(projectChangelogs).length === 0) {
    warn('No project changelogs returned; skipping GitLab release creation.');
    return;
  }
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
    const result = await postGitLabRelease(tagName, contents || `Release ${tagName}`);
    if (result.ok) {
      ok(`GitLab release ${result.existed ? 'already exists' : 'created'}: ${tagName}`);
    } else {
      fail('gitlab-release', project, `${tagName}: ${result.error}`);
    }
    await sleep(300); // stay below the API rate limit
  }
}

// extract the `## <version> ...` section of a generated CHANGELOG.md
function changelogSection(changelog, version) {
  const lines = changelog.split('\n');
  const esc = version.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const head = new RegExp(`^##+ \\[?${esc}\\]?(\\s|$)`);
  const start = lines.findIndex((l) => head.test(l));
  if (start < 0) return '';
  let end = lines.findIndex((l, i) => i > start && /^## /.test(l));
  if (end < 0) end = lines.length;
  return lines.slice(start + 1, end).join('\n').trim();
}

// The projects released by the latest release run: the newest `chore(release): version` commit at or below HEAD
// plus a newer `version rxap` umbrella commit (or the commits given with --commit=<sha,...>).
// Returns [{ commit, file, project, version, tagName }] read from the CHANGELOG.md files each commit touched.
function releaseCommitEntries() {
  let commits = (valueOf('commit') ?? '').split(',').filter(Boolean);
  if (commits.length === 0) {
    // the newest `version` commit ends the run; an umbrella commit (`version rxap`) is newer
    for (const line of capture('git log -50 --format=%H%x09%s').split('\n')) {
      const [sha, subject] = line.split('\t');
      if (subject === 'chore(release): version rxap') commits.push(sha);
      else if (subject === 'chore(release): version') {
        commits.push(sha);
        break;
      }
    }
  }
  if (commits.length === 0) die('No `chore(release): version` commit found in the last 50 commits.');
  console.log(`  release commit(s): ${commits.map((c) => c.slice(0, 9)).join(', ')}`);

  const entries = [];
  for (const commit of commits) {
    const changelogs = capture(`git show --name-only --format= ${commit}`)
      .split('\n')
      .filter((f) => f.endsWith('/CHANGELOG.md') || f === 'CHANGELOG.md');
    for (const file of changelogs) {
      const dir = file.includes('/') ? file.slice(0, file.lastIndexOf('/')) : '.';
      try {
        const project = JSON.parse(capture(`git show ${commit}:${dir === '.' ? '' : dir + '/'}project.json`)).name;
        const version = JSON.parse(capture(`git show ${commit}:${dir === '.' ? '' : dir + '/'}package.json`)).version;
        entries.push({ commit, file, project, version, tagName: project === 'rxap' ? `rxap@${version}` : `@rxap/${project}@${version}` });
      } catch {
        warn(`Skipping ${file}: no project.json/package.json at ${commit.slice(0, 9)}.`);
      }
    }
  }
  return entries;
}

// --gitlab-releases-only: rebuild the release list from the release commit(s) + tags and
// (re)create the GitLab releases; existing releases are skipped (409).
async function gitlabReleasesOnly() {
  log('GitLab releases only');
  let created = 0;
  for (const { commit, file, project, version, tagName } of releaseCommitEntries()) {
    try {
      capture(`git rev-parse --verify --quiet "refs/tags/${tagName}"`);
    } catch {
      fail('gitlab-release', project, `tag ${tagName} does not exist locally (git fetch --tags?)`);
      continue;
    }
    const body = changelogSection(capture(`git show ${commit}:${file}`), version) || `Release ${tagName}`;
    if (DRY_RUN) {
      console.log(`  [dry-run] would create GitLab release ${tagName}`);
      continue;
    }
    const result = await postGitLabRelease(tagName, body);
    if (result.ok) {
      created++;
      ok(`GitLab release ${result.existed ? 'already exists' : 'created'}: ${tagName}`);
    } else {
      fail('gitlab-release', project, `${tagName}: ${result.error}`);
    }
    await sleep(300);
  }
  ok(`Processed GitLab releases (${created} created or existing).`);
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
// --stamped: release projects at the major their package.json was stamped to
// ---------------------------------------------------------------------------
function listReleaseProjects(groupName) {
  return listGroupProjects(groupName);
}

// returns { bySpecifier: Map<specifier, projects[]>, rest: projects[] } (lib/release-plan.mjs stampedPlan)
function stampedPlan(groupName, mode) {
  const plan = planStamped(listReleaseProjects(groupName), mode);
  for (const line of plan.lines) console.log(`  ${line}`);
  return plan;
}

// --projects: version only the selected projects. updateDependents 'never' keeps every other project
// (and its version) untouched — with 'auto' Nx would patch-bump all dependents of the selection.
async function releaseVersionSelected(baseOptions) {
  const { ReleaseClient } = require('nx/release');
  const { releaseVersion } = new ReleaseClient({ version: { updateDependents: 'never' } });
  log(`Version ${PROJECTS.length} selected project(s) at ${FORCED_SPECIFIER ?? '(conventional-commits)'}`);
  return releaseVersion({ ...baseOptions, projects: PROJECTS, specifier: FORCED_SPECIFIER });
}

// one releaseVersion call per distinct stamped specifier (+ one for the remaining projects)
async function releaseVersionStamped(_releaseVersion, groupName, mode, baseOptions) {
  // updateDependents 'never': with 'auto' every filtered call drags in (and patch-bumps from the OLD git
  // tag) all dependents of its projects, clobbering the version a previous call stamped on them.
  // The dependents of a stamped project are stamped themselves; the ^ranges between released
  // projects are still rewritten by Nx and by the update-dependencies target.
  const { ReleaseClient } = require('nx/release');
  const releaseVersion = new ReleaseClient({ version: { updateDependents: 'never' } }).releaseVersion;
  const { bySpecifier, rest } = stampedPlan(groupName, mode);
  const merged = { projectsVersionData: {}, workspaceVersion: undefined };
  const calls = [...[...bySpecifier].map(([specifier, projects]) => ({ specifier, projects }))];
  if (rest.length > 0) calls.push({ specifier: FORCED_SPECIFIER, projects: rest });
  for (const { specifier, projects } of calls) {
    log(`Version ${projects.length} project(s) at ${specifier ?? '(conventional-commits)'}`);
    const result = await releaseVersion({ ...baseOptions, projects, specifier });
    const got = Object.entries(result.projectsVersionData ?? {});
    console.log(`  -> ${got.filter(([, d]) => d?.newVersion).length}/${projects.length} projects versioned (${got.length} entries)`);
    for (const [name, d] of got) {
      // a later call must never erase a version an earlier call assigned (dependents are patch-bumped by updateDependents)
      if (d?.newVersion || !merged.projectsVersionData[name]?.newVersion) merged.projectsVersionData[name] = d;
    }
    merged.workspaceVersion ??= result.workspaceVersion;
  }
  return merged;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  // run from the workspace root regardless of invocation cwd
  process.chdir(capture('git rev-parse --show-toplevel'));

  const mode = computeReleaseMode();
  releaseBranch = mode.branch;
  await preflight(mode);

  if (GITLAB_ONLY) {
    return gitlabReleasesOnly();
  }

  const { releaseVersion, releaseChangelog, releasePublish } = loadNxRelease();

  // ---- fast path: retry just the publish (the release commit and its tags are already pushed) ----
  if (PUBLISH_ONLY) {
    let projects = PROJECTS;
    let umbrella = !SKIP_UMBRELLA;
    if (REBUILD) {
      // CI: a fresh checkout has no dist — rebuild the projects of the release commit(s) at HEAD
      const entries = releaseCommitEntries();
      projects = entries.map((e) => e.project).filter((p) => p !== 'rxap' && (!PROJECTS || PROJECTS.includes(p)));
      umbrella = umbrella && entries.some((e) => e.project === 'rxap');
      log(`Publish-only: rebuild ${projects.length} project(s)${umbrella ? ' + rxap' : ''} of the release commit`);
      if (!DRY_RUN) {
        if (projects.length > 0) {
          buildDist(projects);
          applyDistTransforms({ projects, run });
        }
        if (umbrella) run('pnpm nx run rxap:build');
      }
    } else {
      log('Publish-only: publishing existing dist');
    }
    await publishGroup(releasePublish, 'packages', mode, projects);
    if (umbrella) await publishGroup(releasePublish, 'rxap', mode);
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
    run('pnpm nx reset');
    run(
      PROJECTS
        ? `pnpm nx run-many --targets=build,test,lint --projects=${PROJECTS.join(',')}`
        : 'pnpm nx run-many --targets=build,test,lint --exclude=angular',
    );
  } else if (SKIP_VALIDATE) {
    warn('Skipping validation gate (--skip-validate).');
  }

  // ---- 4. version the `packages` group (source package.json) ----
  log('Version (packages group)');
  const packagesVersionOptions = {
    preid: mode.isPrerelease ? mode.preid : GRADUATE,
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    dryRun: DRY_RUN,
    verbose: VERBOSE,
    firstRelease: FIRST_RELEASE,
  };
  const versionResult = STAMPED
    ? await releaseVersionStamped(releaseVersion, 'packages', mode, packagesVersionOptions)
    : PROJECTS
      ? await releaseVersionSelected(packagesVersionOptions)
      : await releaseVersion({ ...packagesVersionOptions, groups: ['packages'], specifier: FORCED_SPECIFIER });
  const versionData = versionResult.projectsVersionData ?? {};
  const changed = Object.entries(versionData)
    .filter(([, d]) => d?.newVersion)
    .map(([p]) => p);
  if (PROJECTS) {
    const outside = changed.filter((p) => !PROJECTS.includes(p));
    if (outside.length > 0) {
      die(`--projects: Nx versioned projects outside the selection: ${outside.join(', ')}`);
    }
  }

  if (changed.length === 0) {
    return ok('No package version changes detected. Nothing to release.');
  }
  console.log(`  Changed projects (${changed.length}): ${changed.join(', ')}`);

  // ---- 5. source mutations that must precede the build ----
  if (!DRY_RUN) {
    log('Regenerate package groups + README + lockfile (source)');
    run('pnpm nx reset');
    // update-package-group pulls in update-dependencies via its dependsOn (belt-and-suspenders
    // for the internal ^dep pinning that updateDependents/versionPrefix already handles)
    run(
      PROJECTS
        ? `pnpm nx run-many --targets=update-package-group --projects=${changed.join(',')}`
        : 'pnpm nx run-many --targets=update-package-group --exclude=rxap',
    );
    run('pnpm nx reset');
    run('pnpm nx run workspace:readme');
    run('pnpm install --lockfile-only', { allowFailure: true });
  }

  // ---- 6. changelog + single release commit + tags ----
  log('Changelog + commit + tag (packages group)');
  if (!DRY_RUN) run('git add -A'); // stage version + packageGroup + readme + lockfile changes
  const changelogResult = await releaseChangelog({
    ...(PROJECTS ? { projects: changed } : { groups: ['packages'] }),
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
  unpushedRelease = !DRY_RUN;

  // ---- 7. production build → dist (carries bumped version + packageGroup + CHANGELOG) ----
  if (!DRY_RUN && !SKIP_BUILD) {
    buildDist(changed);
  } else if (SKIP_BUILD) {
    warn('Skipping production build (--skip-build).');
  }

  // ---- 8. dist transforms (former prepack) ----
  if (!DRY_RUN) {
    log('Dist transforms (theme export, strip workspace marker, strip ng-prism showcases)');
    // theme export, workspace marker, prism-strip and the ng-prism guard (check-dist-for-ng-prism.mjs) —
    // shared with the package-manager e2e matrix. `run` dies on a failure, before anything is tagged.
    applyDistTransforms({ projects: changed, run });
  }

  // ---- 8b. tag the release commit — only now that build and dist checks passed ----
  const untagged = tagReleases(changelogResult.projectChangelogs);

  // ---- 8c. push commit + tags BEFORE publishing: a rejected push (branch moved meanwhile) aborts with
  // nothing published, and every published version has its tag on the remote ----
  pushRelease(mode);

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

}

// production build of the given projects into dist/{projectRoot} (docs first: the build copies them)
function buildDist(projects) {
  log('Production build → dist');
  const list = projects.join(',');
  run('pnpm nx reset');
  run(`pnpm nx run-many --targets=readme --projects=${list} --exclude=angular --skip-nx-cache --nxBail`);
  run(`pnpm nx run-many --targets=compodoc --projects=${list} --exclude=angular,workspace --skip-nx-cache --nxBail`);
  run(`pnpm nx run-many --targets=typedoc --projects=${list} --exclude=angular,workspace --skip-nx-cache --nxBail`);
  run(`pnpm nx run-many --targets=build --configuration=production --projects=${list} --exclude=angular --skip-nx-cache --nxBail`);
}

// Push the release commit(s) and the tags of this run in one atomic push to origin/<branch>. Runs before the
// publish: when it is rejected (the branch moved during the release) nothing was published, so the run aborts
// and is simply repeated — rebasing the release commit instead would tag a tree that was not built.
function pushRelease(mode) {
  if (DRY_RUN) {
    console.log(`  [dry-run] would push HEAD:${mode.branch} + ${createdTags.length} tag(s)`);
    createdTags.length = 0;
    return;
  }
  log(`Push release commit + ${createdTags.length} tag(s) → origin/${mode.branch}`);
  const args = pushArgs({ branch: mode.branch, tags: createdTags, pushOptions: PUSH_OPTIONS });
  console.log(C.blue(`  $ git ${args.slice(0, 5 + PUSH_OPTIONS.length * 2).join(' ')} ...`));
  const res = spawnSync('git', args, { stdio: 'inherit', env: process.env });
  if (res.status !== 0) {
    die(`git push to origin/${mode.branch} was rejected (branch moved or no push permission) — nothing was published.`);
  }
  unpushedRelease = false;
  createdTags.length = 0;
  ok('Pushed.');
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
      createdTags.push(tag);
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
      createdTags.push(tag);
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
      createdTags.push(tag);
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
    run('pnpm nx reset');
    run('pnpm nx run rxap:update-package-group --skip-nx-cache');
    // conventional commit so the umbrella gets a patch (or prerelease) bump
    run('git add -A', { allowFailure: true });
    if (run('git commit -m "fix(rxap): update package group" --no-verify', { allowFailure: true })) {
      unpushedRelease = true;
    }
  }

  const umbrellaVersionOptions = {
    preid: mode.isPrerelease ? mode.preid : GRADUATE,
    stageChanges: false,
    gitCommit: false,
    gitTag: false,
    dryRun: DRY_RUN,
    verbose: VERBOSE,
    firstRelease: FIRST_RELEASE,
  };
  const versionResult = STAMPED
    ? await releaseVersionStamped(releaseVersion, 'rxap', mode, umbrellaVersionOptions)
    : await releaseVersion({ ...umbrellaVersionOptions, groups: ['rxap'], specifier: FORCED_SPECIFIER });
  const versionData = versionResult.projectsVersionData ?? {};
  if (!Object.values(versionData).some((d) => d?.newVersion)) {
    if (unpushedRelease) pushRelease(mode); // the package group commit alone
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
  unpushedRelease = !DRY_RUN;
  if (tagReleases(changelogResult.projectChangelogs).length > 0) {
    return; // already reported by tagReleases
  }

  if (!DRY_RUN && !SKIP_BUILD) {
    run('pnpm nx reset');
    run('pnpm nx run rxap:build');
  }

  pushRelease(mode);
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
