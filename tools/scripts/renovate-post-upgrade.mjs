#!/usr/bin/env node
/**
 * Renovate postUpgradeTask (renovate.json5, allowed by RENOVATE_ALLOWED_COMMANDS in .gitlab/ci/renovate.yml).
 *
 * Runs in the Renovate working copy after every dependency update:
 *   1. align-framework-dep-versions.mjs  copies the root ranges into every package.json
 *   2. renovate-tiers.mjs --missing-only gives new dependencies their cooldown tier
 *   3. pnpm install --lockfile-only      lockfile for the aligned manifests
 *   4. audit-lockfile-cooldown.mjs <base> --write-resolutions
 *                                        pins transitive versions that are younger than their tier, then the
 *                                        lockfile is resolved again
 * It never fails on remaining cooldown violations: the supply-chain:check job of the merge request decides.
 */
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRun = (cmd, args, { allowFailure = false } = {}) => {
  console.log(`RUN: ${ [ cmd, ...args ].join(' ') }`);
  try {
    execFileSync(cmd, args, { stdio: 'inherit' });
    return true;
  } catch (e) {
    if (!allowFailure) {
      throw e;
    }
    console.log(`(exit ${ e.status ?? '?' }, continuing)`);
    return false;
  }
};

const defaultGit = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: [ 'ignore', 'pipe', 'ignore' ] }).trim();

/** the merge base with the Renovate base branch (default development), null if the clone does not have it */
export function resolveBase(git = defaultGit, branch = process.env.RENOVATE_BASE_BRANCH || 'development') {
  for (const ref of [ `origin/${ branch }`, branch ]) {
    try {
      return git('merge-base', 'HEAD', ref);
    } catch {
      // ref not in this clone
    }
  }
  return null;
}

export function postUpgrade({ run = defaultRun, base = resolveBase() } = {}) {
  run('node', [ 'tools/scripts/align-framework-dep-versions.mjs' ]);
  run('node', [ 'tools/scripts/renovate-tiers.mjs', '--missing-only' ]);
  run('pnpm', [ 'install', '--lockfile-only', '--ignore-scripts' ]);
  if (!base) {
    console.log('no base ref in this clone: transitive cooldown pins skipped (supply-chain:check decides)');
    return;
  }
  const clean = run('node', [ 'tools/scripts/audit-lockfile-cooldown.mjs', base, '--write-resolutions' ], { allowFailure: true });
  if (!clean) {
    run('pnpm', [ 'install', '--lockfile-only', '--ignore-scripts' ]);
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  postUpgrade();
}
