#!/usr/bin/env node
/**
 * npm trusted publishing setup for every published package (RELEASE_WORKFLOW.md "Releases in CI").
 * Runs on the laptop with an interactive npm login (account 2FA); CI never needs an npm token.
 *
 *   list                         npm names of all published packages (packages group + rxap umbrella)
 *   configure [--from <name>] [--dry-run]
 *                                `npm trust gitlab <name> --project rxap/packages --file .gitlab-ci.yml --env npm
 *                                --allow-publish --yes` for each package, 2 s apart. The first call asks for 2FA;
 *                                tick "skip 2FA for 5 minutes" (~80 packages), resume with --from after it expires.
 *                                A new configuration EXPIRES when no publish succeeds through it within 2 days:
 *                                run the bootstrap release the same day.
 *   check                        `npm trust list <name>` per package: reports packages without (or with another)
 *                                GitLab configuration
 *   lock [--from <name>] [--dry-run]
 *                                `npm access set mfa=publish <name>` ("require 2FA and disallow tokens"); only after
 *                                the first publish through trusted publishing worked
 *
 * npm >= 11.15 is required for `npm trust`; it runs as the pinned, cooldown-eligible NPM below through pnpm dlx.
 */
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listReleaseProjects } from './lib/release-plan.mjs';

export const NPM = 'npm@11.21.2';
export const TRUST = { project: 'rxap/packages', file: '.gitlab-ci.yml', environment: 'npm' };

/** npm names of every published package, sorted */
export const packageNames = (root = '.') =>
  [ ...listReleaseProjects('packages', { root, tags: [] }), ...listReleaseProjects('rxap', { root, tags: [] }) ]
    .map(p => p.pkgName).sort();

export const trustArgs = name => [
  'trust', 'gitlab', name,
  '--project', TRUST.project, '--file', TRUST.file, '--env', TRUST.environment,
  '--allow-publish', '--yes',
];

/** names from `--from <name>` on (resume after the 2FA window) */
export function fromName(names, from) {
  if (!from) {
    return names;
  }
  const i = names.indexOf(from);
  if (i < 0) {
    throw new Error(`--from ${ from }: not a published package`);
  }
  return names.slice(i);
}

/** does a `npm trust list --json` answer contain the expected GitLab configuration? */
export function matchesTrust(json) {
  const text = JSON.stringify(json ?? '');
  return text.includes(TRUST.project) && text.includes(TRUST.file);
}

const npm = (args, opts = {}) => spawnSync('pnpm', [ 'dlx', NPM, ...args ], { encoding: 'utf-8', ...opts });
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function eachPackage(names, dryRun, argsOf) {
  const failed = [];
  for (const [ i, name ] of names.entries()) {
    const args = argsOf(name);
    console.log(`[${ i + 1 }/${ names.length }] npm ${ args.join(' ') }`);
    if (dryRun) {
      continue;
    }
    const res = npm(args, { stdio: 'inherit' });
    if (res.status !== 0) {
      failed.push(name);
      console.error(`  failed: ${ name } (resume with --from ${ name })`);
    }
    await sleep(2000);
  }
  if (failed.length) {
    console.error(`${ failed.length } failed: ${ failed.join(', ') }`);
    return 1;
  }
  return 0;
}

async function main([ cmd, ...argv ]) {
  const dryRun = argv.includes('--dry-run');
  const i = argv.indexOf('--from');
  const names = fromName(packageNames(), i >= 0 ? argv[i + 1] : undefined);
  switch (cmd) {
    case 'list':
      console.log(names.join('\n'));
      console.error(`${ names.length } packages`);
      return 0;
    case 'configure':
      return eachPackage(names, dryRun, trustArgs);
    case 'lock':
      return eachPackage(names, dryRun, name => [ 'access', 'set', 'mfa=publish', name ]);
    case 'check': {
      const bad = [];
      for (const name of names) {
        const res = npm([ 'trust', 'list', name, '--json' ]);
        let json;
        try {
          json = JSON.parse(res.stdout);
        } catch {
          json = null;
        }
        if (res.status !== 0 || !matchesTrust(json)) {
          bad.push(name);
          console.log(`✗ ${ name }: ${ (res.stdout || res.stderr).trim().slice(0, 200) || 'no configuration' }`);
        } else {
          console.log(`✔ ${ name }`);
        }
      }
      console.log(bad.length ? `${ bad.length } package(s) without the expected configuration` : 'all packages configured');
      return bad.length ? 1 : 0;
    }
    default:
      console.error('usage: npm-trust.mjs <list|configure|check|lock> [--from <name>] [--dry-run]');
      return 2;
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exit(await main(process.argv.slice(2)));
}
