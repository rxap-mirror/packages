/**
 * Angular / Nx / NestJS move as groups: a framework update always moves every installed member of its group, and a
 * version is only usable when EVERY member passed its release cooldown (UPGRADE-NOTES.md section 4). Used by
 * framework-watch.mjs (which version to migrate to) and align-framework-group.mjs (complete a migration).
 *
 * - lockstep members: the exact version of the leader (or the version the leader's packageGroup names);
 *   taken from the registry metadata (`ng-update` / `nx-migrations` packageGroup) or a fixed list.
 * - followers: own version line; the newest eligible version on the leader's major.minor (`minor`), its major
 *   (`major`) or any version the peers allow (`any`). A follower with a packageGroup moves it in lockstep too.
 * - peer gate: a plan is rejected when it CREATES a peer conflict with an installed package outside the plan
 *   (e.g. Angular 23 while @nx/angular only accepts < 23). Conflicts that already exist do not block (@nx/nest).
 */
import { createRequire } from 'node:module';
import { eligibleVersions, isEligible, tierDays } from './cooldown.mjs';

const require = createRequire(import.meta.url);
const semver = require('semver');

export const GROUPS = [
  {
    id: 'nx',
    leader: 'nx',
    packageGroupField: 'nx-migrations',
    followers: [ { match: /^@swc(-node)?\//, line: 'any' } ],
  },
  {
    id: 'angular',
    leader: '@angular/core',
    packageGroupField: 'ng-update',
    followers: [
      { leader: '@angular/cli', line: 'minor', packageGroupField: 'ng-update' },
      { leader: '@angular/material', line: 'minor', packageGroupField: 'ng-update' },
      { match: /^@schematics\/angular$/, line: 'minor' },
      { match: /^ng-packagr$/, line: 'minor' },
      { match: /^@angular-eslint\//, line: 'major' },
    ],
  },
  {
    id: 'nestjs',
    leader: '@nestjs/core',
    lockstep: [ '@nestjs/common', '@nestjs/microservices', '@nestjs/platform-express', '@nestjs/platform-fastify', '@nestjs/platform-socket.io', '@nestjs/platform-ws', '@nestjs/testing', '@nestjs/websockets' ],
    followers: [
      { match: /^@nestjs\//, line: 'any' },
      { match: /^(@types\/)?(cache-manager|class-transformer|class-validator|cookie-parser|helmet|swagger-ui-express|csurf|express)$/, line: 'any' },
    ],
  },
];

export const groupById = id => GROUPS.find(g => g.id === id);

/** the group whose leader is `name` (nx-migrate branch names carry the leader: migrate/@angular_core/22.3.1) */
export const groupByLeader = name => GROUPS.find(g => g.leader === name);

/** root dependencies: name -> { section, range, version } */
export function rootDeps(pkg) {
  const out = {};
  for (const section of [ 'dependencies', 'devDependencies' ]) {
    for (const [ name, range ] of Object.entries(pkg[section] ?? {})) {
      const v = semver.validRange(range) && semver.minVersion(range);
      if (v) {
        out[name] = { section, range, version: v.version };
      }
    }
  }
  return out;
}

/** name -> required version (null = same as the group version) from a packageGroup (array or name->version map) */
export function packageGroupOf(meta, field) {
  const group = meta?.[field]?.packageGroup;
  const out = {};
  if (Array.isArray(group)) {
    for (const entry of group) {
      if (typeof entry === 'string') {
        out[entry] = null;
      } else if (entry?.package && semver.valid(entry.version)) {
        out[entry.package] = entry.version;
      }
    }
  } else if (group && typeof group === 'object') {
    for (const [ name, version ] of Object.entries(group)) {
      out[name] = semver.valid(version) ? version : null;
    }
  }
  return out;
}

/** does `v` lie on the release line of `base` (`minor`: same major.minor, `major`: same major, `any`) */
export function onLine(v, base, line) {
  if (line === 'minor') {
    return semver.major(v) === semver.major(base) && semver.minor(v) === semver.minor(base);
  }
  if (line === 'major') {
    return semver.major(v) === semver.major(base);
  }
  return true;
}

/**
 * Plan the update of `group` to leader `version`.
 * @param ctx { deps: rootDeps(pkg), getDoc, weeklyDownloads, resolver (createResolver, preloaded), now }
 * @returns { ok, version, changes: [{ name, section, from, to }], pending: [reason] }
 */
export async function planGroup(group, version, ctx) {
  const { deps, getDoc, weeklyDownloads, resolver, now = Date.now() } = ctx;
  const pending = [];
  const plan = {}; // name -> version

  const tierOf = async name => tierDays(await weeklyDownloads(name));

  /**
   * require `name@v` to be published and old enough. The installed version is accepted as it is: it already went
   * through the cooldown (or a dated exception in pnpm-workspace.yaml); only a change is checked.
   */
  async function requireExact(name, v) {
    const doc = await getDoc(name);
    if (deps[name]?.version === v) {
      plan[name] = v;
      return doc;
    }
    const days = await tierOf(name);
    if (!doc?.versions?.[v]) {
      pending.push(`${ name }@${ v } is not published`);
    } else if (!isEligible(doc, v, days, now)) {
      const age = doc.time?.[v] ? ((now - Date.parse(doc.time[v])) / 86_400_000).toFixed(1) : '?';
      pending.push(`${ name }@${ v } is ${ age }d old < ${ days }d`);
    }
    plan[name] = v;
    return doc;
  }

  /** lockstep members of a (follower) leader at version v */
  async function lockstepOf(leaderDoc, field, names, v, leaderName) {
    const members = field ? packageGroupOf(leaderDoc?.versions?.[v], field) : Object.fromEntries((names ?? []).map(n => [ n, null ]));
    for (const [ name, pinned ] of Object.entries(members)) {
      if (name !== leaderName && deps[name]) {
        await requireExact(name, pinned ?? v);
      }
    }
  }

  // leader + lockstep members
  const leaderDoc = await requireExact(group.leader, version);
  await lockstepOf(leaderDoc, group.packageGroupField, group.lockstep, version, group.leader);

  // followers
  const followerNames = new Set();
  for (const f of group.followers ?? []) {
    if (f.leader) {
      if (!deps[f.leader] || plan[f.leader]) {
        continue;
      }
      followerNames.add(f.leader);
      const doc = await getDoc(f.leader);
      const days = await tierOf(f.leader);
      let chosen;
      const installed = deps[f.leader].version;
      const candidates = eligibleVersions(doc ?? { versions: {} }, { cooldownDays: days, now }).filter(v => onLine(v, version, f.line));
      if (onLine(installed, version, f.line) && !candidates.includes(installed)) {
        candidates.push(installed);
        candidates.sort(semver.rcompare);
      }
      for (const v of candidates) {
        const before = pending.length;
        const snapshot = { ...plan };
        plan[f.leader] = v;
        await lockstepOf(doc, f.packageGroupField, null, v, f.leader);
        if (pending.length === before) {
          chosen = v;
          break;
        }
        // a member of this candidate is too young: try the next older version on the line
        pending.length = before;
        Object.keys(plan).forEach(k => delete plan[k]);
        Object.assign(plan, snapshot);
      }
      if (!chosen) {
        pending.push(`${ f.leader }: no eligible version on ${ f.line } line of ${ version }`);
      }
      continue;
    }
    for (const name of Object.keys(deps).filter(n => f.match.test(n) && !(n in plan) && n !== group.leader)) {
      followerNames.add(name);
    }
  }
  for (const name of followerNames) {
    if (name in plan) {
      continue;
    }
    const spec = (group.followers ?? []).find(f => f.match?.test(name));
    if (!spec) {
      continue;
    }
    const doc = await getDoc(name);
    if (!doc) {
      continue;
    }
    const days = await tierOf(name);
    const current = deps[name].version;
    const candidates = eligibleVersions(doc, { cooldownDays: days, now })
      .filter(v => spec.line === 'any' ? semver.gte(v, current) : onLine(v, version, spec.line));
    if ((spec.line === 'any' || onLine(current, version, spec.line)) && !candidates.includes(current)) {
      candidates.push(current); // the installed version is always acceptable
      candidates.sort(semver.rcompare);
    }
    const target = candidates.find(v => peerRegressions(name, v, current, doc, plan, ctx).length === 0);
    if (target) {
      plan[name] = target;
    } else if (spec.line !== 'any' && !onLine(current, version, spec.line)) {
      pending.push(`${ name }: no eligible version on ${ spec.line } line of ${ version }`);
    }
  }

  // peer gate for the whole plan
  for (const [ name, v ] of Object.entries(plan)) {
    const doc = await getDoc(name);
    const current = deps[name]?.version;
    if (doc && current && v !== current) {
      pending.push(...peerRegressions(name, v, current, doc, plan, ctx));
    }
  }

  const changes = Object.entries(plan)
    .filter(([ name, v ]) => deps[name] && deps[name].version !== v)
    .map(([ name, to ]) => ({ name, section: deps[name].section, from: deps[name].range, to }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { ok: pending.length === 0, version, changes, pending: [ ...new Set(pending) ] };
}

/** peer conflicts that `name@v` creates and `name@current` does not have (forward + reverse, plan members excluded) */
export function peerRegressions(name, v, current, doc, plan, { resolver, deps }) {
  const overrides = { ...plan };
  const skip = new Set(Object.keys(plan));
  const key = c => c.replace(/@[^@\s]+ (!~|needs)/, ' $1');
  const existing = new Set([
    ...resolver.peerConflicts(doc.versions[current] ?? {}, overrides),
    ...resolver.reversePeerConflicts(name, current, overrides, skip),
  ].map(key));
  const now = [
    ...resolver.peerConflicts(doc.versions[v] ?? {}, overrides),
    ...resolver.reversePeerConflicts(name, v, overrides, skip),
  ];
  return now.filter(c => !existing.has(key(c))).map(c => `${ name }@${ v }: ${ c }`);
}

/**
 * The newest leader version whose whole group is eligible.
 * @returns { current, target?, plan?, pending: [{ version, reasons }] } (target undefined = nothing to do)
 */
export async function newestGroupVersion(group, ctx, { maxCandidates = 12 } = {}) {
  const { deps, getDoc, weeklyDownloads, now = Date.now() } = ctx;
  const current = deps[group.leader]?.version;
  if (!current) {
    return { current, pending: [ { version: '-', reasons: [ `${ group.leader } is not a root dependency` ] } ] };
  }
  const doc = await getDoc(group.leader);
  const days = tierDays(await weeklyDownloads(group.leader));
  const latest = doc?.['dist-tags']?.latest;
  const candidates = eligibleVersions(doc, { cooldownDays: days, now }).filter(v => semver.gt(v, current)).slice(0, maxCandidates);
  const pending = [];
  if (latest && semver.gt(latest, current) && !candidates.includes(latest)) {
    pending.push({ version: latest, reasons: [ `${ group.leader }@${ latest } is younger than ${ days }d` ] });
  }
  for (const v of candidates) {
    const plan = await planGroup(group, v, ctx);
    if (plan.ok) {
      return { current, target: v, plan, pending };
    }
    pending.push({ version: v, reasons: plan.pending });
  }
  return { current, pending };
}

/**
 * The lookup context for planGroup / newestGroupVersion on the real registry. Preloads the registry docs of all
 * root dependencies, which the reverse peer check needs.
 */
export async function createContext(pkg, { now = Date.now() } = {}) {
  const { createDownloads, createResolver, pinnedVersions } = await import('./cooldown.mjs');
  const weeklyDownloads = createDownloads();
  const resolver = createResolver({ workspaceVersions: pinnedVersions(pkg), weeklyDownloads, now: () => now });
  const deps = rootDeps(pkg);
  await resolver.preload(Object.keys(deps).filter(n => !n.startsWith('@rxap/')));
  return { deps, getDoc: resolver.doc, weeklyDownloads, resolver, now };
}
