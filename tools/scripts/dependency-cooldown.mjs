#!/usr/bin/env node
/**
 * Supply-chain-safe dependency upgrade resolver.
 *
 * For every external dependency of the root package.json it picks the newest STABLE version that
 *   1. has been published for at least the cooldown of its popularity tier, and
 *   2. whose peerDependencies are satisfied by the versions the workspace itself pins
 *      (so the "highest compatible major" is chosen instead of blindly the latest).
 *
 * Cooldown tiers (weekly npm downloads of the package):
 *   >= 1_000_000  ->  7 days   (very popular)
 *   >=   100_000  -> 14 days
 *   <    100_000  -> 30 days   (niche packages: more time for the community to spot a bad release)
 *
 * Usage:
 *   node tools/scripts/dependency-cooldown.mjs [--apply] [--only a,b] [--skip a,b] [--json out.json]
 *        [--ignore-peers-of a,b] [--pin name=range,...] [--status minor|major] [--section dependencies|devDependencies] [--min-age-days N]  (raises every tier to at least N)
 *
 * Without --apply the script only reports. With --apply the root package.json is rewritten (the
 * entries are written as EXACT versions so the lockfile can never resolve to a newer, un-vetted release).
 * Run `pnpm install` afterwards.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { createDownloads, createResolver, DOWNLOAD_CACHE, pinnedVersions, pool } from './lib/cooldown.mjs';

const require = createRequire(import.meta.url);
const semver = require('semver');

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${ name }`);
const opt = (name) => {
  const i = args.indexOf(`--${ name }`);
  return i >= 0 ? args[i + 1] : undefined;
};

const ROOT = resolve(new URL('../..', import.meta.url).pathname);
const PKG_PATH = resolve(ROOT, 'package.json');
const pkg = JSON.parse(readFileSync(PKG_PATH, 'utf8'));

const ONLY = opt('only')?.split(',');
// --ignore-peers-of a,b: do not let these installed packages block upgrades through their (optional) peer ranges
const IGNORE_PEERS_OF = new Set(opt('ignore-peers-of')?.split(',') ?? []);
const SKIP = new Set(opt('skip')?.split(',') ?? []);
const SECTIONS = opt('section')?.split(',') ?? [ 'dependencies', 'devDependencies' ];
const APPLY_STATUS = opt('status'); // limit --apply to 'minor' or 'major' changes
const MIN_AGE = Number(opt('min-age-days') ?? 0);

/** Packages that must follow something other than "newest major". */
const NODE_MAJOR = semver.minVersion(pkg.engines?.node ?? '>=22')?.major ?? 22;
const HOLD = {
  // typings must match the minimum supported Node runtime, not the newest Node
  '@types/node': `^${ NODE_MAJOR }.0.0`,
};

// --pin name=range[,name=range]: restrict candidates to a semver range (e.g. --pin firebase-admin=^13)
for (const entry of (opt('pin') ?? '').split(',').filter(Boolean)) {
  const i = entry.lastIndexOf('=');
  HOLD[entry.slice(0, i)] = entry.slice(i + 1);
}

const weeklyDownloads = createDownloads({ cachePath: resolve(ROOT, DOWNLOAD_CACHE) });
const workspaceVersions = pinnedVersions(pkg);
const { resolveOne, preload } = createResolver({
  workspaceVersions,
  weeklyDownloads,
  hold: HOLD,
  ignorePeersOf: IGNORE_PEERS_OF,
  minAgeDays: MIN_AGE,
});

const work = [];
for (const section of SECTIONS) {
  for (const [ name, range ] of Object.entries(pkg[section] ?? {})) {
    if (name.startsWith('@rxap/') || SKIP.has(name) || (ONLY && !ONLY.includes(name))) {
      continue;
    }
    work.push({ name, range, section });
  }
}

// the reverse peer check needs the metadata of EVERY workspace dependency, not only of the selected ones
await preload(Object.keys(workspaceVersions).filter(n => !n.startsWith('@rxap/')));
let results = await pool(work, 6, w => resolveOne(w.name, w.range, w.section, {}, true));
let converged = false;
for (let pass = 0; pass < 10 && !converged; pass++) {
  const overrides = {};
  for (const r of results) {
    if (r.target) {
      overrides[r.name] = r.target;
    }
  }
  const next = await pool(work, 6, w => resolveOne(w.name, w.range, w.section, overrides));
  converged = next.every((r, i) => r.target === results[i].target);
  results = next;
}
if (!converged) {
  console.warn('WARNING: peer resolution did not converge; review the report manually');
}

const order = { major: 0, minor: 1, error: 2, skipped: 3, current: 4 };
results.sort((a, b) => (order[a.status] - order[b.status]) || a.name.localeCompare(b.name));
for (const r of results) {
  if (r.status === 'current' && !r.note) continue;
  const line = r.status === 'error' || r.status === 'skipped'
    ? `${ r.status.toUpperCase().padEnd(7) } ${ r.name } ${ r.current } (${ r.reason })`
    : `${ r.status.toUpperCase().padEnd(7) } ${ r.name.padEnd(42) } ${ String(r.current).padEnd(10) } -> ${ String(r.target ?? '').padEnd(10) } `
    + `[latest ${ r.latest }, ${ r.latestAgeDays }d old; cooldown ${ r.cooldownDays }d @ ${ r.weekly }/wk]`
    + (r.note ? ` ${ r.note }` : '')
    + (r.rejected?.length ? ` | peer-rejected ${ r.rejected[0] }` : '');
  console.log(line);
}
const count = (s) => results.filter(r => r.status === s).length;
console.log(`\nmajor ${ count('major') }, minor/patch ${ count('minor') }, up-to-date ${ count('current') }, errors ${ count('error') }, skipped ${ count('skipped') }`);

if (opt('json')) {
  writeFileSync(resolve(opt('json')), JSON.stringify(results, null, 2));
}

if (flag('apply')) {
  let changed = 0;
  for (const r of results) {
    if ((r.status === 'major' || r.status === 'minor') && r.newRange && (!APPLY_STATUS || APPLY_STATUS === r.status)) {
      pkg[r.section][r.name] = r.newRange;
      changed++;
    }
  }
  writeFileSync(PKG_PATH, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`Applied ${ changed } changes to package.json. Run \`pnpm install\` next.`);
}
