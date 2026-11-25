/**
 * Release cooldown rules shared by the dependency tooling (dependency-cooldown.mjs, renovate-tiers.mjs,
 * framework-watch.mjs, align-framework-group.mjs). Policy: UPGRADE-NOTES.md section 4.
 *
 * Tiers by weekly npm downloads: >= 1_000_000 -> 7 days, >= 100_000 -> 14 days, else (or unknown) -> 30 days.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';

const require = createRequire(import.meta.url);
const semver = require('semver');

export const TIERS = [
  { minWeekly: 1_000_000, days: 7 },
  { minWeekly: 100_000, days: 14 },
  { minWeekly: 0, days: 30 },
];
export const DAY = 86_400_000;
export const REGISTRY = 'https://registry.npmjs.org';
export const DOWNLOAD_CACHE = 'node_modules/.cache/dependency-cooldown-downloads.json';

/** cooldown days for a weekly download count; unknown popularity never loosens the policy (strictest tier) */
export function tierDays(weekly, minAgeDays = 0) {
  const days = TIERS.find(t => (weekly ?? -1) >= t.minWeekly)?.days ?? TIERS.at(-1).days;
  return Math.max(days, minAgeDays);
}

export const encodeName = name => name.replace('/', '%2f');

export async function getJson(url, retries = 4) {
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

/** the full registry document (versions, time, dist-tags) of a package, null if unknown */
export const registryDoc = name => getJson(`${ REGISTRY }/${ encodeName(name) }`);

/**
 * Weekly download lookup with a file cache. api.npmjs.org rate-limits aggressively: calls are serialised and
 * 429 / Retry-After is honoured. Returns null when the count is unknown.
 */
export function createDownloads({ cachePath = DOWNLOAD_CACHE, ttl = 24 * 3600 * 1000 } = {}) {
  let cache = {};
  try {
    cache = JSON.parse(readFileSync(cachePath, 'utf8'));
  } catch {
    // no cache yet
  }
  const save = () => {
    try {
      mkdirSync(dirname(cachePath), { recursive: true });
      writeFileSync(cachePath, JSON.stringify(cache));
    } catch {
      // the cache is optional
    }
  };
  let queue = Promise.resolve();
  const lookup = async name => {
    for (let attempt = 0; attempt < 8; attempt++) {
      const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${ encodeName(name) }`);
      if (res.status === 429) {
        const wait = Number(res.headers.get('retry-after')) || 2 * (attempt + 1);
        await new Promise(r => setTimeout(r, wait * 1000));
        continue;
      }
      if (!res.ok) {
        return null;
      }
      const weekly = (await res.json()).downloads ?? 0;
      cache[name] = { weekly, at: Date.now() };
      save();
      await new Promise(r => setTimeout(r, 150));
      return weekly;
    }
    return null;
  };
  const weeklyDownloads = name => {
    if (cache[name] && Date.now() - cache[name].at < ttl) {
      return Promise.resolve(cache[name].weekly);
    }
    const result = queue.then(() => lookup(name));
    queue = result.catch(() => null);
    return result;
  };
  weeklyDownloads.cache = cache;
  return weeklyDownloads;
}

/** age of `version` in days, undefined when the registry has no publish time */
export function ageDays(doc, version, now = Date.now()) {
  const t = doc?.time?.[version];
  return t ? (now - Date.parse(t)) / DAY : undefined;
}

/**
 * Stable versions of `doc` that passed the cooldown, newest first: no prereleases, nothing above the `latest`
 * dist-tag (some projects publish "next" builds as plain semver versions), not deprecated, within `hold`.
 */
export function eligibleVersions(doc, { cooldownDays, hold, now = Date.now() }) {
  const latest = doc['dist-tags']?.latest;
  return Object.keys(doc.versions ?? {})
    .filter(v => !semver.prerelease(v))
    .filter(v => !hold || semver.satisfies(v, hold))
    .filter(v => !latest || semver.lte(v, latest))
    .filter(v => !doc.versions[v].deprecated)
    .filter(v => (ageDays(doc, v, now) ?? -1) >= cooldownDays)
    .sort(semver.rcompare);
}

/** is exactly `version` of `doc` usable under the cooldown (stable, published, not deprecated, old enough)? */
export function isEligible(doc, version, cooldownDays, now = Date.now()) {
  const meta = doc?.versions?.[version];
  return !!meta && !semver.prerelease(version) && !meta.deprecated && (ageDays(doc, version, now) ?? -1) >= cooldownDays;
}

/** the minimum version of every semver range in package.json sections (the versions the workspace pins) */
export function pinnedVersions(pkg, sections = [ 'dependencies', 'devDependencies' ]) {
  const out = {};
  for (const section of sections) {
    for (const [ name, range ] of Object.entries(pkg[section] ?? {})) {
      const v = semver.validRange(range) && semver.minVersion(range);
      if (v) {
        out[name] = v.version;
      }
    }
  }
  return out;
}

/**
 * Peer-aware resolver for the newest eligible version of a dependency.
 * @param workspaceVersions name -> installed version (pinnedVersions(pkg))
 * @param getDoc name -> Promise<registry doc | null> (cached by the resolver)
 * @param weeklyDownloads name -> Promise<number | null>
 * @param hold name -> semver range the candidates must satisfy
 * @param ignorePeersOf installed packages whose peer ranges must not block an upgrade
 */
export function createResolver({
  workspaceVersions,
  getDoc = registryDoc,
  weeklyDownloads,
  hold = {},
  ignorePeersOf = new Set(),
  minAgeDays = 0,
  now = () => Date.now(),
}) {
  const docCache = {};
  const doc = name => (docCache[name] ??= Promise.resolve(getDoc(name)));

  /** forward check: are the candidate's peers satisfied by the workspace (+ overrides)? */
  function peerConflicts(versionMeta, overrides = {}) {
    const conflicts = [];
    for (const [ peer, range ] of Object.entries(versionMeta.peerDependencies ?? {})) {
      // optional peers still bind when the package is installed in the workspace
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

  /** reverse check: do the installed packages still accept `candidate` of `name`? (needs preload() first) */
  function reversePeerConflicts(name, candidate, overrides = {}, skip = new Set()) {
    const conflicts = [];
    for (const dep of Object.keys(workspaceVersions)) {
      if (dep === name || ignorePeersOf.has(dep) || skip.has(dep)) {
        continue;
      }
      const installed = overrides[dep] ?? workspaceVersions[dep];
      const meta = docCache[dep]?.resolved?.versions?.[installed];
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

  /** load (and keep) the registry docs of `names`; the reverse peer check only sees loaded docs */
  async function preload(names, concurrency = 6) {
    await pool(names, concurrency, async name => {
      const p = doc(name);
      p.resolved = await p;
      return name;
    });
  }

  async function resolveOne(name, range, section, overrides = {}, ignorePeers = false) {
    if (/^(workspace:|file:|link:|patch:|npm:|git|http)/.test(range) || !semver.validRange(range)) {
      return { name, section, current: range, status: 'skipped', reason: 'non-registry range' };
    }
    const p = doc(name);
    const d = p.resolved ??= await p;
    if (!d) {
      return { name, section, current: range, status: 'skipped', reason: 'not on registry' };
    }
    const weekly = (await weeklyDownloads(name)) ?? 0;
    const cooldownDays = tierDays(weekly, minAgeDays);
    const at = now();
    const current = semver.minVersion(range).version;
    const latest = d['dist-tags']?.latest;
    const candidates = eligibleVersions(d, { cooldownDays, hold: hold[name], now: at });

    const rejected = [];
    let target;
    for (const v of candidates) {
      if (semver.lt(v, current)) {
        break; // never downgrade
      }
      const conflicts = ignorePeers ? [] : [ ...peerConflicts(d.versions[v], overrides), ...reversePeerConflicts(name, v, overrides) ];
      if (conflicts.length === 0) {
        target = v;
        break;
      }
      if (rejected.length < 3) {
        rejected.push(`${ v }: ${ conflicts.join(', ') }`);
      }
    }
    const latestAgeDays = latest ? Math.floor(ageDays(d, latest, at)) : undefined;
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
      publishedDaysAgo: Math.floor(ageDays(d, target, at)),
    };
  }

  return { resolveOne, peerConflicts, reversePeerConflicts, preload, doc: name => doc(name).then(r => r) };
}

/** run `fn` over `items` with at most `size` in flight; errors become `{ ...item, status: 'error' }` */
export async function pool(items, size, fn) {
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
