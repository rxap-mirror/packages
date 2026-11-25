#!/usr/bin/env node
/**
 * Supply-chain audit of a lockfile change.
 *
 * Lists every npm package version that is resolved in the current pnpm-lock.yaml but not in the lockfile
 * of <base-ref> (new transitive versions included) and reports the ones that were published more
 * recently than the cooldown of their popularity tier allows:
 *   >= 1_000_000 downloads/week -> 7 days, >= 100_000 -> 14 days, otherwise 30 days.
 * Downloads are only looked up for versions younger than 30 days (older ones pass every tier).
 * A <base-ref> from before the pnpm migration is read from its yarn.lock.
 *
 * Usage: node tools/scripts/audit-lockfile-cooldown.mjs <base-ref> [--min-age-days N] [--write-resolutions]
 *
 * --write-resolutions pins every violating package to the newest version that satisfies the same
 * range and is old enough (pnpm-workspace.yaml `overrides`, key `name@range`; the ranges are the ones
 * the dependents request). Run `pnpm install` and the audit again afterwards. The pins can be dropped
 * once the floating version has aged enough.
 * Exit code 1 when violations are found.
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const semver = require('semver');
const YAML = require('yaml');

const DAY = 86_400_000;
const LOCKFILE = 'pnpm-lock.yaml';
const WORKSPACE_FILE = 'pnpm-workspace.yaml';

/** `name@version(peer@x)(...)` or `name@version` -> { name, version } (null for non-registry entries) */
export function parsePackageKey(key) {
  const plain = key.replace(/\(.*$/, '');
  const at = plain.lastIndexOf('@');
  if (at <= 0) {
    return null;
  }
  const name = plain.slice(0, at);
  const version = plain.slice(at + 1);
  return semver.valid(version) ? { name, version } : null;
}

/** the lockfile document of a pnpm-lock.yaml (pnpm >= 11 prepends a document for the package manager itself) */
export function pnpmLockDocument(text) {
  return YAML.parseAllDocuments(text).map(d => d.toJS()).filter(d => d?.packages || d?.importers).at(-1) ?? {};
}

/** Map `name@version` -> { name, version } of every registry package in a pnpm-lock.yaml */
export function pnpmResolutions(text) {
  const set = new Map();
  for (const key of Object.keys(pnpmLockDocument(text).packages ?? {})) {
    const parsed = parsePackageKey(key);
    if (parsed) {
      set.set(`${ parsed.name }@${ parsed.version }`, parsed);
    }
  }
  return set;
}

/** Map `name@version` -> { name, version } of every npm package in a yarn berry yarn.lock */
export function yarnResolutions(text) {
  const set = new Map();
  for (const m of text.matchAll(/^\s+resolution: "(@?[^@"]+)@npm:([^"]+)"$/gm)) {
    set.set(`${ m[1] }@${ m[2] }`, { name: m[1], version: m[2] });
  }
  return set;
}

/**
 * The ranges a package version is requested with: specifiers of the workspace importers that resolve to it,
 * and (via `manifestOf(name, version)`) the dependency ranges of every package that depends on it.
 */
export async function requestedRanges(lock, { name, version }, manifestOf) {
  const ranges = new Set();
  const resolvesTo = ref => typeof ref === 'string' && ref.replace(/\(.*$/, '') === version;
  for (const importer of Object.values(lock.importers ?? {})) {
    for (const type of [ 'dependencies', 'devDependencies', 'optionalDependencies' ]) {
      const dep = importer[type]?.[name];
      if (dep && resolvesTo(dep.version) && semver.validRange(dep.specifier)) {
        ranges.add(dep.specifier);
      }
    }
  }
  for (const [ key, snapshot ] of Object.entries(lock.snapshots ?? {})) {
    const depends = [ 'dependencies', 'optionalDependencies' ].some(type => resolvesTo(snapshot?.[type]?.[name]));
    const dependent = depends && parsePackageKey(key);
    if (!dependent) {
      continue;
    }
    const manifest = await manifestOf(dependent.name, dependent.version);
    const range = manifest?.dependencies?.[name] ?? manifest?.optionalDependencies?.[name] ?? manifest?.peerDependencies?.[name];
    if (range && semver.validRange(range)) {
      ranges.add(range);
    }
  }
  return [ ...ranges ];
}

async function getJson(url, retries = 6) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.status === 429) {
      await new Promise(r => setTimeout(r, (Number(res.headers.get('retry-after')) || 2 * (i + 1)) * 1000));
      continue;
    }
    if (!res.ok) {
      return null;
    }
    return res.json();
  }
  return null;
}

const encode = name => name.replace('/', '%2f');

const packumentCache = {};
function packument(name) {
  packumentCache[name] ??= getJson(`https://registry.npmjs.org/${ encode(name) }`).then(d => d ?? {});
  return packumentCache[name];
}
const publishTimes = async name => (await packument(name)).time ?? {};
const manifestOf = async (name, version) => (await packument(name)).versions?.[version];

async function pool(items, size, fn) {
  const out = [];
  let i = 0;
  await Promise.all(Array.from({ length: size }, async () => {
    while (i < items.length) {
      const idx = i++;
      out[idx] = await fn(items[idx]).catch(e => ({ ...items[idx], error: String(e) }));
    }
  }));
  return out;
}

function baseResolutions(base) {
  const show = file => execSync(`git show ${ base }:${ file }`, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: [ 'ignore', 'pipe', 'ignore' ] });
  try {
    return pnpmResolutions(show(LOCKFILE));
  } catch {
    return yarnResolutions(show('yarn.lock'));
  }
}

/**
 * Every registry version resolved in the current pnpm-lock.yaml but not in the lockfile of `base`, and the ones of
 * them that are younger than the cooldown of their popularity tier (at least `minAge` days).
 */
export async function auditLockfile(base, { minAge = 0, lockText = readFileSync(LOCKFILE, 'utf8'), log = console.log } = {}) {
  const before = baseResolutions(base);
  const after = pnpmResolutions(lockText);
  const added = [ ...after.entries() ].filter(([ key ]) => !before.has(key)).map(([ , v ]) => v);
  log(`${ added.length } new package versions in ${ LOCKFILE } compared to ${ base }`);

  const dated = await pool(added, 8, async ({ name, version }) => {
    const time = (await publishTimes(name))[version];
    return { name, version, ageDays: time ? (Date.now() - Date.parse(time)) / DAY : undefined };
  });

  const young = dated.filter(d => d.ageDays === undefined || d.ageDays < Math.max(30, minAge));
  const violations = [];
  for (const d of young) {
    const dl = d.ageDays === undefined ? 0 : (await getJson(`https://api.npmjs.org/downloads/point/last-week/${ encode(d.name) }`))?.downloads ?? 0;
    const required = Math.max(dl >= 1_000_000 ? 7 : dl >= 100_000 ? 14 : 30, minAge);
    if (d.ageDays === undefined || d.ageDays < required) {
      violations.push({ ...d, weekly: dl, required });
    }
    await new Promise(r => setTimeout(r, 150));
  }
  return { added, violations: violations.sort((a, b) => (a.ageDays ?? 0) - (b.ageDays ?? 0)) };
}

/** one report line per violation */
export const formatViolation = v =>
  `TOO YOUNG ${ v.name }@${ v.version }  ${ v.ageDays === undefined ? 'unknown age' : `${ v.ageDays.toFixed(1) }d old` } < ${ v.required }d (${ v.weekly }/wk)`;

async function main() {
  const base = process.argv[2];
  if (!base) {
    console.error('usage: audit-lockfile-cooldown.mjs <base-ref>');
    process.exit(2);
  }
  const minAgeIdx = process.argv.indexOf('--min-age-days');
  const MIN_AGE = minAgeIdx >= 0 ? Number(process.argv[minAgeIdx + 1]) : 0;

  const lockText = readFileSync(LOCKFILE, 'utf8');
  const { added, violations } = await auditLockfile(base, { minAge: MIN_AGE, lockText });

  if (process.argv.includes('--write-resolutions')) {
    const lock = pnpmLockDocument(lockText);
    const doc = YAML.parseDocument(readFileSync(WORKSPACE_FILE, 'utf8'));
    let written = 0;
    for (const v of violations) {
      const times = await publishTimes(v.name);
      for (const range of await requestedRanges(lock, v, manifestOf)) {
        const chosen = Object.keys(times)
          .filter(c => semver.valid(c) && !semver.prerelease(c) && semver.satisfies(c, range))
          .filter(c => (Date.now() - Date.parse(times[c])) / DAY >= v.required)
          .sort(semver.rcompare)[0];
        if (chosen) {
          doc.setIn([ 'overrides', `${ v.name }@${ range }` ], chosen);
          written++;
        } else {
          console.log(`NO ELIGIBLE VERSION for ${ v.name }@${ range }`);
        }
      }
    }
    writeFileSync(WORKSPACE_FILE, doc.toString({ lineWidth: 0 }));
    console.log(`wrote ${ written } override(s) to ${ WORKSPACE_FILE }`);
  }

  for (const v of violations) {
    console.log(formatViolation(v));
  }
  console.log(`\n${ violations.length } violation(s) among ${ added.length } new versions`);
  process.exit(violations.length ? 1 : 0);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  await main();
}
