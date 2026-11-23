#!/usr/bin/env node
/**
 * Supply-chain audit of a lockfile change.
 *
 * Lists every npm package version that is resolved in the current yarn.lock but not in the yarn.lock
 * of <base-ref> (new transitive versions included) and reports the ones that were published more
 * recently than the cooldown of their popularity tier allows:
 *   >= 1_000_000 downloads/week -> 7 days, >= 100_000 -> 14 days, otherwise 30 days.
 * Downloads are only looked up for versions younger than 30 days (older ones pass every tier).
 *
 * Usage: node tools/scripts/audit-lockfile-cooldown.mjs <base-ref> [--min-age-days N] [--write-resolutions]
 *
 * --write-resolutions pins every violating package to the newest version that satisfies the same
 * descriptor and is old enough (root package.json `resolutions`, key `name@range`). Run `yarn`
 * and the audit again afterwards. The pins can be dropped once the floating version has aged enough.
 * Exit code 1 when violations are found.
 */
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';

const semver = createRequire(import.meta.url)('semver');

const base = process.argv[2];
if (!base) {
  console.error('usage: audit-lockfile-cooldown.mjs <base-ref>');
  process.exit(2);
}
const minAgeIdx = process.argv.indexOf('--min-age-days');
const MIN_AGE = minAgeIdx >= 0 ? Number(process.argv[minAgeIdx + 1]) : 0;

const DAY = 86_400_000;

function resolutions(text) {
  const set = new Map();
  for (const m of text.matchAll(/^\s+resolution: "(@?[^@"]+)@npm:([^"]+)"$/gm)) {
    set.set(`${ m[1] }@${ m[2] }`, { name: m[1], version: m[2] });
  }
  return set;
}

const before = resolutions(execSync(`git show ${ base }:yarn.lock`, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }));
const after = resolutions(readFileSync('yarn.lock', 'utf8'));
const added = [ ...after.entries() ].filter(([ key ]) => !before.has(key)).map(([ , v ]) => v);
console.log(`${ added.length } new package versions in yarn.lock compared to ${ base }`);

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

const timeCache = {};
async function publishTimes(name) {
  timeCache[name] ??= getJson(`https://registry.npmjs.org/${ name.replace('/', '%2f') }`).then(d => d?.time ?? {});
  return timeCache[name];
}

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

const dated = await pool(added, 8, async ({ name, version }) => {
  const time = (await publishTimes(name))[version];
  return { name, version, ageDays: time ? (Date.now() - Date.parse(time)) / DAY : undefined };
});

const young = dated.filter(d => d.ageDays === undefined || d.ageDays < Math.max(30, MIN_AGE));
const violations = [];
let queue = Promise.resolve();
for (const d of young) {
  queue = queue.then(async () => {
    const dl = d.ageDays === undefined ? 0 : (await getJson(`https://api.npmjs.org/downloads/point/last-week/${ d.name.replace('/', '%2f') }`))?.downloads ?? 0;
    const required = Math.max(dl >= 1_000_000 ? 7 : dl >= 100_000 ? 14 : 30, MIN_AGE);
    if (d.ageDays === undefined || d.ageDays < required) {
      violations.push({ ...d, weekly: dl, required });
    }
    await new Promise(r => setTimeout(r, 150));
  });
}
await queue;

if (process.argv.includes('--write-resolutions')) {
  const lock = readFileSync('yarn.lock', 'utf8');
  const pkgPath = 'package.json';
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  pkg.resolutions ??= {};
  let written = 0;
  for (const v of violations) {
    const times = await publishTimes(v.name);
    const blocks = [ ...lock.matchAll(/^((?:"?[^\n]+"?:)\n(?:  .*\n)+?)(?=\n|$)/gm) ].map(m => m[1])
      .filter(b => b.includes(`resolution: "${ v.name }@npm:${ v.version }"`));
    for (const block of blocks) {
      const header = block.split('\n')[0].replace(/:$/, '').replace(/"/g, '');
      for (const descriptor of header.split(',').map(d => d.trim())) {
        const range = descriptor.slice(`${ v.name }@npm:`.length);
        if (!descriptor.startsWith(`${ v.name }@npm:`) || !semver.validRange(range)) {
          continue;
        }
        const chosen = Object.keys(times)
          .filter(c => semver.valid(c) && !semver.prerelease(c) && semver.satisfies(c, range))
          .filter(c => (Date.now() - Date.parse(times[c])) / DAY >= v.required)
          .sort(semver.rcompare)[0];
        if (chosen) {
          pkg.resolutions[`${ v.name }@${ range }`] = chosen; // yarn 3 only honours the key without the npm: protocol
          written++;
        } else {
          console.log(`NO ELIGIBLE VERSION for ${ descriptor }`);
        }
      }
    }
  }
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log(`wrote ${ written } resolution(s) to package.json`);
}

for (const v of violations.sort((a, b) => (a.ageDays ?? 0) - (b.ageDays ?? 0))) {
  console.log(`TOO YOUNG ${ v.name }@${ v.version }  ${ v.ageDays === undefined ? 'unknown age' : `${ v.ageDays.toFixed(1) }d old` } < ${ v.required }d (${ v.weekly }/wk)`);
}
console.log(`\n${ violations.length } violation(s) among ${ added.length } new versions`);
process.exit(violations.length ? 1 : 0);
