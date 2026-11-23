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
 * Run `yarn` afterwards.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';

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

const TIERS = [
  { minWeekly: 1_000_000, days: 7 },
  { minWeekly: 100_000, days: 14 },
  { minWeekly: 0, days: 30 },
];

const DAY = 86_400_000;
const REGISTRY = 'https://registry.npmjs.org';

async function getJson(url, retries = 4) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, { headers: { accept: 'application/json' } });
      if (res.status === 404) {
        return null;
      }
      if (!res.ok) {
        throw new Error(`${ res.status } ${ url }`);
      }
      return await res.json();
    } catch (e) {
      if (i === retries - 1) {
        throw e;
      }
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}

const CACHE_PATH = resolve(ROOT, 'node_modules/.cache/dependency-cooldown-downloads.json');
let downloadCache = {};
try {
  downloadCache = JSON.parse(readFileSync(CACHE_PATH, 'utf8'));
} catch {
  // no cache yet
}
const CACHE_TTL = 24 * 3600 * 1000;

function saveCache() {
  try {
    mkdirSync(dirname(CACHE_PATH), { recursive: true });
    writeFileSync(CACHE_PATH, JSON.stringify(downloadCache));
  } catch {
    // cache is optional
  }
}

/** api.npmjs.org rate-limits aggressively: serialise calls and honour 429 / Retry-After. */
let downloadQueue = Promise.resolve();

function weeklyDownloads(name) {
  const cached = downloadCache[name];
  if (cached && Date.now() - cached.at < CACHE_TTL) {
    return Promise.resolve(cached.weekly);
  }
  const run = async () => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${ name.replace('/', '%2f') }`);
      if (res.status === 429) {
        const wait = Number(res.headers.get('retry-after')) || 2 * (attempt + 1);
        await new Promise(r => setTimeout(r, wait * 1000));
        continue;
      }
      if (!res.ok) {
        return null;
      }
      const weekly = (await res.json()).downloads ?? 0;
      downloadCache[name] = { weekly, at: Date.now() };
      saveCache();
      await new Promise(r => setTimeout(r, 150));
      return weekly;
    }
    return null;
  };
  const result = downloadQueue.then(run);
  downloadQueue = result.catch(() => null);
  return result;
}

function tierFor(weekly) {
  const tier = TIERS.find(t => weekly >= t.minWeekly);
  return Math.max(tier.days, MIN_AGE);
}

/** Versions the workspace pins itself; used to validate peerDependencies of candidates. */
const workspaceVersions = {};
for (const section of [ 'dependencies', 'devDependencies' ]) {
  for (const [ name, range ] of Object.entries(pkg[section] ?? {})) {
    const v = semver.minVersion(range);
    if (v) {
      workspaceVersions[name] = v.version;
    }
  }
}

function peerConflicts(versionMeta, overrides) {
  const conflicts = [];
  for (const [ peer, range ] of Object.entries(versionMeta.peerDependencies ?? {})) {
    // optional peers still bind when the package is installed in the workspace (checked via `have` below)
    const have = overrides[peer] ?? workspaceVersions[peer];
    // ranges with dist-tag tokens (e.g. ">=3.0.0 || insiders") are not valid semver: only the semver part can be checked
    if (!have || !semver.validRange(range)) {
      continue;
    }
    if (!semver.satisfies(have, range, { includePrerelease: true })) {
      conflicts.push(`${ peer }@${ have } !~ ${ range }`);
    }
  }
  return conflicts;
}

/** Reverse check: do the packages that are already installed still accept `candidate` of `name`? */
function reversePeerConflicts(name, candidate, overrides) {
  const conflicts = [];
  for (const dep of Object.keys(workspaceVersions)) {
    if (dep === name || IGNORE_PEERS_OF.has(dep)) {
      continue;
    }
    const installed = overrides[dep] ?? workspaceVersions[dep];
    const meta = docCache[dep]?.versions?.[installed];
    const range = meta?.peerDependencies?.[name];
    if (!range || !semver.validRange(range)) {
      continue;
    }
    if (!semver.satisfies(candidate, range, { includePrerelease: true })) {
      conflicts.push(`${ dep }@${ installed } needs ${ name } ${ range }`);
    }
  }
  return conflicts;
}

const docCache = {};

async function resolveOne(name, range, section, overrides = {}, ignorePeers = false) {
  if (/^(workspace:|file:|link:|patch:|npm:|git|http)/.test(range) || !semver.validRange(range)) {
    return { name, section, current: range, status: 'skipped', reason: 'non-registry range' };
  }
  const doc = await (docCache[name] ??= getJson(`${ REGISTRY }/${ name.replace('/', '%2f') }`));
  if (!doc) {
    return { name, section, current: range, status: 'skipped', reason: 'not on registry' };
  }
  const weeklyRaw = await weeklyDownloads(name);
  // Unknown popularity must never loosen the policy: fall back to the strictest tier.
  const weekly = weeklyRaw ?? 0;
  const cooldownDays = tierFor(weekly);
  const now = Date.now();
  const current = semver.minVersion(range).version;
  const latest = doc['dist-tags']?.latest;

  const candidates = Object.keys(doc.versions)
    .filter(v => !semver.prerelease(v))
    .filter(v => !HOLD[name] || semver.satisfies(v, HOLD[name]))
    // never leave the `latest` channel (some projects publish "next" builds as plain semver versions)
    .filter(v => !latest || semver.lte(v, latest))
    .filter(v => !doc.versions[v].deprecated)
    .filter(v => doc.time?.[v] && (now - Date.parse(doc.time[v])) >= cooldownDays * DAY)
    .sort(semver.rcompare);

  const rejected = [];
  let target;
  for (const v of candidates) {
    if (semver.lt(v, current)) {
      break; // never downgrade
    }
    const conflicts = ignorePeers ? [] : [ ...peerConflicts(doc.versions[v], overrides), ...reversePeerConflicts(name, v, overrides) ];
    if (conflicts.length === 0) {
      target = v;
      break;
    }
    if (rejected.length < 3) {
      rejected.push(`${ v }: ${ conflicts.join(', ') }`);
    }
  }
  const latestAgeDays = latest ? Math.floor((now - Date.parse(doc.time[latest])) / DAY) : undefined;
  const base = { name, section, current: range, latest, latestAgeDays, weekly, cooldownDays, rejected };
  if (!target || semver.eq(target, current)) {
    const stale = latest && semver.gt(latest, current);
    return { ...base, status: 'current', target: current, note: stale ? `latest ${ latest } not eligible (cooldown/peers)` : undefined };
  }
  return {
    ...base,
    status: semver.major(target) > semver.major(current) ? 'major' : 'minor',
    target,
    // exact pin: a ^/~ range would let the package manager float to a release that never went through the cooldown
    newRange: target,
    publishedDaysAgo: Math.floor((now - Date.parse(doc.time[target])) / DAY),
  };
}

async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) {
      const idx = i++;
      try {
        out[idx] = await fn(items[idx]);
      } catch (e) {
        out[idx] = { ...items[idx], status: 'error', reason: String(e.message ?? e) };
      }
    }
  }));
  return out;
}

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
await pool(Object.keys(workspaceVersions).filter(n => !n.startsWith('@rxap/')), 6, async name => {
  docCache[name] ??= getJson(`${ REGISTRY }/${ name.replace('/', '%2f') }`);
  docCache[name] = await docCache[name];
  return name;
});
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
  console.log(`Applied ${ changed } changes to package.json. Run \`yarn\` next.`);
}
