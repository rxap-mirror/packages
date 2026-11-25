#!/usr/bin/env node
/**
 * Release jobs of the CI (RELEASE_WORKFLOW.md "Releases in CI", .gitlab/ci/release.yml).
 *
 *   nightly  development → `-dev` prerelease (dist-tag development). Runs release.mjs only when
 *            - the push pipeline of the newest non-release commit on the branch succeeded (green gate: the release
 *              then skips its own build/test/lint validation),
 *            - every package already exists on npm (trusted publishing cannot create a package).
 *            Adds --stamped when post-migrate stamped a framework major. "Nothing to release" is decided by
 *            release.mjs itself (conventional commits), before it builds anything.
 *   stable   fast-forwards `latest` to `development`, same gate, then the graduation release on `latest`
 *            (`--graduate --gitlab-release`, RELEASE_SPECIFIER optional), then fast-forwards `development` to
 *            the release commit(s).
 *
 * Usage: node tools/scripts/release-ci.mjs <nightly|stable> [--dry-run]
 *   --dry-run: only prints the decision (no token needed: the pipeline gate is reported as unknown)
 * Env: RELEASE_GITLAB_TOKEN (api read), CI_API_V4_URL, CI_PROJECT_ID, RELEASE_SPECIFIER (optional)
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './lib/cooldown.mjs';
import { isReleaseCommit, isStamped, listReleaseProjects } from './lib/release-plan.mjs';

export const ACTIVE = new Set([ 'created', 'waiting_for_resource', 'preparing', 'pending', 'running', 'scheduled', 'manual' ]);

/** the newest commit that is not a commit written by release.mjs (those are pushed with ci.skip, no pipeline) */
export const baseCommit = commits => commits.find(c => !isReleaseCommit(c.subject)) ?? null;

/**
 * @param kind 'nightly' | 'stable'
 * @param commits [{ sha, subject }] newest first (origin/development)
 * @param pipeline status of the base commit's push pipeline: 'success' | 'failed' | ... | null (none) | 'unknown'
 * @param stamped names of projects with a stamped framework major
 * @param missing npm names that do not exist on the registry
 * @param specifier optional RELEASE_SPECIFIER
 * @returns { action: 'run' | 'skip' | 'fail', reasons: string[], args: string[], base }
 */
export function decide({ kind, commits, pipeline, stamped = [], missing = [], specifier }) {
  const base = baseCommit(commits);
  const reasons = [];
  if (missing.length > 0) {
    return {
      action: 'fail', base, args: [],
      reasons: [ `not on npm yet (publish the first version by hand, then \`node tools/scripts/npm-trust.mjs configure --from <name>\`): ${ missing.join(', ') }` ],
    };
  }
  if (!base) {
    return { action: 'skip', base, args: [], reasons: [ 'no commit besides release commits in the history window' ] };
  }
  const short = `${ base.sha.slice(0, 9) } (${ base.subject })`;
  if (pipeline === 'unknown') {
    reasons.push(`pipeline of ${ short } not checked (no RELEASE_GITLAB_TOKEN)`);
  } else if (pipeline !== 'success') {
    const why = pipeline === null ? 'has no push pipeline' : ACTIVE.has(pipeline) ? `pipeline still ${ pipeline }` : `pipeline ${ pipeline }`;
    // nightly: a red or running pipeline just waits for the next night; a stable release was asked for explicitly
    return { action: kind === 'stable' ? 'fail' : 'skip', base, args: [], reasons: [ `${ short } ${ why }` ] };
  } else {
    reasons.push(`pipeline of ${ short } succeeded`);
  }
  const args = [ '--skip-validate' ];
  if (kind === 'stable') {
    if (stamped.length > 0) {
      return { action: 'fail', base, args: [], reasons: [ `stamped majors not released yet (run the nightly first): ${ stamped.join(', ') }` ] };
    }
    args.push('--graduate', '--gitlab-release');
  } else if (stamped.length > 0) {
    args.push('--stamped');
    reasons.push(`stamped majors: ${ stamped.join(', ') }`);
  }
  if (specifier) {
    args.push(`--specifier=${ specifier }`);
  }
  return { action: 'run', base, args, reasons };
}

const git = (...args) => execFileSync('git', args, { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 }).trim();

export function readCommits(ref, n = 50) {
  return git('log', `-${ n }`, '--format=%H%x09%s', ref).split('\n').filter(Boolean).map(l => {
    const [ sha, ...rest ] = l.split('\t');
    return { sha, subject: rest.join('\t') };
  });
}

/** status of the newest push pipeline of `sha` on `ref`; 'unknown' without token, null when there is none */
export async function pipelineStatus(sha, ref, {
  api = process.env.CI_API_V4_URL,
  project = process.env.CI_PROJECT_ID,
  token = process.env.RELEASE_GITLAB_TOKEN,
} = {}) {
  if (!api || !project || !token) {
    return 'unknown';
  }
  const url = `${ api }/projects/${ encodeURIComponent(project) }/pipelines?sha=${ sha }&ref=${ encodeURIComponent(ref) }&source=push&per_page=5`;
  const res = await fetch(url, { headers: { 'PRIVATE-TOKEN': token } });
  if (!res.ok) {
    throw new Error(`GET pipelines: ${ res.status } ${ await res.text() }`);
  }
  const list = await res.json();
  return list[0]?.status ?? null;
}

/** npm names (of `names`) that the registry does not know */
export async function missingOnNpm(names, registry = process.env.PUBLISH_REGISTRY || 'https://registry.npmjs.org') {
  const missing = [];
  const results = await pool(names, 8, async name => {
    const res = await fetch(`${ registry }/${ name.replace('/', '%2f') }`, {
      method: 'HEAD',
      headers: { accept: 'application/vnd.npm.install-v1+json' },
    });
    if (res.status === 404) {
      missing.push(name);
    } else if (!res.ok) {
      throw new Error(`${ name }: registry answered ${ res.status }`);
    }
    return { status: 'ok' };
  });
  const errors = results.filter(r => r?.status === 'error').map(r => r.reason);
  if (errors.length > 0) {
    throw new Error(`npm registry check failed: ${ errors.slice(0, 5).join('; ') }`);
  }
  return missing.sort();
}

function run(cmd, args, env = {}) {
  console.log(`$ ${ cmd } ${ args.join(' ') }`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, ...env } });
  return res.status ?? 1;
}

async function main([ kind, ...argv ]) {
  if (kind !== 'nightly' && kind !== 'stable') {
    console.error('usage: release-ci.mjs <nightly|stable> [--dry-run]');
    return 2;
  }
  const dryRun = argv.includes('--dry-run');
  const source = process.env.RELEASE_SOURCE_BRANCH || process.env.CI_DEFAULT_BRANCH || 'development';
  git('fetch', '--quiet', '--tags', '--force', 'origin', source);

  const commits = readCommits(`origin/${ source }`);
  const base = baseCommit(commits);
  const pipeline = base ? await pipelineStatus(base.sha, source) : null;
  const packages = listReleaseProjects('packages');
  const stamped = packages.filter(isStamped).map(p => p.name);
  const names = [ ...packages, ...listReleaseProjects('rxap') ].map(p => p.pkgName);
  const missing = await missingOnNpm(names);
  const decision = decide({ kind, commits, pipeline, stamped, missing, specifier: process.env.RELEASE_SPECIFIER || undefined });

  console.log(`${ kind }: ${ decision.action } — ${ decision.reasons.join('; ') }`);
  if (decision.action !== 'run') {
    return decision.action === 'fail' ? 1 : 0;
  }
  const release = [ 'tools/scripts/release.mjs', ...decision.args ];
  if (dryRun) {
    console.log(`[dry-run] ${ kind === 'stable' ? `git checkout -B latest origin/${ source } && ` : '' }node ${ release.join(' ') }`);
    return 0;
  }

  if (kind === 'nightly') {
    // release the branch tip the gate looked at (the job may have started on an older commit)
    git('checkout', '-B', source, `origin/${ source }`);
    return run('node', release, { YES: 'true', GIT_BRANCH: source });
  }

  // stable: latest := development (fast-forward only), release on latest, development := latest
  if (spawnSync('git', [ 'merge-base', '--is-ancestor', 'origin/latest', `origin/${ source }` ]).status !== 0) {
    console.error(`origin/latest is not an ancestor of origin/${ source }: fast-forward impossible, resolve by hand.`);
    return 1;
  }
  git('checkout', '-B', 'latest', `origin/${ source }`);
  const code = run('node', release, { YES: 'true', GIT_BRANCH: 'latest' });
  if (code !== 0) {
    return code;
  }
  if (run('git', [ 'push', '-o', 'ci.skip', 'origin', `HEAD:refs/heads/${ source }` ]) !== 0) {
    console.error(`${ source } moved during the release; bring the release commits over by hand:\n` +
      `  git fetch origin && git checkout ${ source } && git merge --ff-only origin/latest || git merge origin/latest`);
    return 1;
  }
  return 0;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exit(await main(process.argv.slice(2)));
}
