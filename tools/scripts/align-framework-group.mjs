#!/usr/bin/env node
/**
 * Completes a framework update: moves every installed member of the Angular / Nx / NestJS group to the version of
 * its leader (lockstep members) and the followers to their newest eligible version (tools/scripts/lib/framework-groups.mjs).
 * Fails when a member is too young for its release cooldown; then the whole update has to wait.
 *
 * Usage:
 *   node tools/scripts/align-framework-group.mjs [group...] [--latest] [--changed-since <ref>] [--dry-run]
 *     group            nx | angular | nestjs (default: all groups)
 *     --latest         first move the leader to the newest version whose whole group is eligible
 *                      (default: keep the leader version of package.json, e.g. the one nx migrate wrote)
 *     --changed-since  only the groups with a member whose root version differs from <ref>:package.json
 *                      (post-migrate.sh: the migrated group, not every group)
 *
 * Writes exact versions into the root package.json; run align-framework-dep-versions.mjs and pnpm install next.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createContext, GROUPS, newestGroupVersion, planGroup, rootDeps } from './lib/framework-groups.mjs';

/** groups with a member (leader, packageGroup, follower pattern) whose version changed between two root manifests */
export function changedGroups(groups, before, after) {
  const a = rootDeps(before);
  const b = rootDeps(after);
  const changed = Object.keys(b).filter(n => a[n]?.version !== b[n].version);
  return groups.filter(g => changed.some(n => n === g.leader
    || g.lockstep?.includes(n)
    || (g.packageGroupField === 'nx-migrations' && n.startsWith('@nx/'))
    || (g.packageGroupField === 'ng-update' && n.startsWith('@angular/'))
    || g.followers?.some(f => f.leader === n || f.match?.test(n))));
}

/** apply plan changes to a package.json object (exact versions) */
export function applyChanges(pkg, changes) {
  for (const c of changes) {
    pkg[c.section][c.name] = c.to;
  }
  return pkg;
}

async function main(argv) {
  const opt = name => {
    const i = argv.indexOf(`--${ name }`);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const ids = argv.filter((a, i) => !a.startsWith('--') && !argv[i - 1]?.startsWith('--changed-since'));
  const pkgPath = resolve('package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  let groups = ids.length ? GROUPS.filter(g => ids.includes(g.id)) : GROUPS;
  const since = opt('changed-since');
  if (since) {
    const before = JSON.parse(execFileSync('git', [ 'show', `${ since }:package.json` ], { encoding: 'utf8' }));
    groups = changedGroups(groups, before, pkg);
    console.log(`groups changed since ${ since }: ${ groups.map(g => g.id).join(', ') || 'none' }`);
  }
  if (!groups.length) {
    return 0;
  }
  const ctx = await createContext(pkg);
  let failed = false;
  for (const group of groups) {
    let plan;
    if (argv.includes('--latest')) {
      const res = await newestGroupVersion(group, ctx);
      plan = res.plan ?? await planGroup(group, res.current, ctx);
      res.pending.forEach(p => console.log(`  ${ group.id } ${ p.version } pending: ${ p.reasons.join('; ') }`));
    } else {
      plan = await planGroup(group, ctx.deps[group.leader]?.version, ctx);
    }
    if (!plan.ok) {
      failed = true;
      console.error(`${ group.id } ${ plan.version }: NOT eligible\n  ${ plan.pending.join('\n  ') }`);
      continue;
    }
    console.log(`${ group.id } ${ plan.version }: ${ plan.changes.length ? '' : 'aligned' }`);
    plan.changes.forEach(c => console.log(`  ${ c.name } ${ c.from } -> ${ c.to }`));
    applyChanges(pkg, plan.changes);
  }
  if (!argv.includes('--dry-run')) {
    writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  }
  return failed ? 1 : 0;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exit(await main(process.argv.slice(2)));
}
