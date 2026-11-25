#!/usr/bin/env node
/**
 * Framework watch (FRAMEWORK-WATCH.md): finds the newest Angular / Nx / NestJS version whose whole package group
 * passed the release cooldown (tools/scripts/lib/framework-groups.mjs) and starts the migration by creating the
 * branch `migrate/<leader>/<version>` (scoped names with `_`: migrate/@angular_core/22.3.2). The push pipeline of
 * that branch runs the nx-migrate job of rxap/gitlab-ci (nx migrate, migrations, post-migrate.sh, merge request).
 *
 * One migration at a time (they all change package.json and the lockfile), priority nx > angular > nestjs. An open
 * migration of a group is superseded (merge request closed, branch deleted) when a newer version of that group is
 * eligible. A version whose merge request was closed without merging is not proposed again.
 *
 * Usage: node tools/scripts/framework-watch.mjs [--apply] [--group nx,angular,nestjs]
 *   without --apply: only prints the plan (no token needed)
 *   --apply: needs GITLAB_TOKEN (api scope), CI_API_V4_URL, CI_PROJECT_ID; base branch CI_DEFAULT_BRANCH (development)
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { createContext, GROUPS, groupByLeader, newestGroupVersion } from './lib/framework-groups.mjs';

const require = createRequire(import.meta.url);
const semver = require('semver');

/** migrate/<leader>/<version>, the first `/` of a scoped name as `_` (the nx-migrate job reverses it) */
export const branchName = (leader, version) => `migrate/${ leader.replace('/', '_') }/${ version }`;

/** { leader, version, group } of a migrate branch, null for other branches */
export function parseBranch(branch) {
  const m = /^migrate\/([^/]+)\/([^/]+)$/.exec(branch ?? '');
  if (!m) {
    return null;
  }
  const leader = m[1].startsWith('@') ? m[1].replace('_', '/') : m[1];
  return { leader, version: m[2], group: groupByLeader(leader)?.id ?? null };
}

/**
 * The actions for this run.
 * @param targets [{ group, leader, version }] eligible group versions newer than the installed one, by priority
 * @param open [{ branch, mrIid? }] open migrations (open merge requests and migrate branches without one)
 * @param rejected Set of branch names whose merge request was closed without merging
 * @returns [{ type: 'create' | 'supersede' | 'wait' | 'skip', ... }]
 */
export function decide(targets, open, rejected = new Set()) {
  const actions = [];
  const openByGroup = new Map();
  for (const o of open) {
    const parsed = parseBranch(o.branch);
    if (parsed?.group) {
      openByGroup.set(parsed.group, { ...o, ...parsed });
    }
  }
  let started = false;
  for (const t of targets) {
    const branch = branchName(t.leader, t.version);
    const current = openByGroup.get(t.group);
    if (rejected.has(branch)) {
      actions.push({ type: 'skip', group: t.group, branch, reason: 'merge request was closed without merging' });
      continue;
    }
    if (current) {
      if (current.branch === branch || !semver.valid(current.version) || !semver.gt(t.version, current.version)) {
        actions.push({ type: 'wait', group: t.group, branch: current.branch, reason: 'migration already open' });
      } else {
        actions.push({ type: 'supersede', group: t.group, old: current, branch, version: t.version });
      }
      started = true;
      continue;
    }
    if (started || openByGroup.size > 0) {
      actions.push({ type: 'wait', group: t.group, branch, reason: `another migration is open (${ [ ...openByGroup.values() ].map(o => o.branch).join(', ') || 'this run' })` });
      continue;
    }
    actions.push({ type: 'create', group: t.group, branch, version: t.version });
    started = true;
  }
  return actions;
}

/** minimal GitLab REST client (fetch, PRIVATE-TOKEN) */
export function gitlab({ api = process.env.CI_API_V4_URL, project = process.env.CI_PROJECT_ID, token = process.env.GITLAB_TOKEN } = {}) {
  if (!api || !project || !token) {
    throw new Error('--apply needs CI_API_V4_URL, CI_PROJECT_ID and GITLAB_TOKEN');
  }
  const base = `${ api }/projects/${ encodeURIComponent(project) }`;
  const call = async (method, path, body) => {
    const res = await fetch(`${ base }${ path }`, {
      method,
      headers: { 'PRIVATE-TOKEN': token, ...(body ? { 'content-type': 'application/json' } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok && !(method === 'DELETE' && res.status === 404)) {
      throw new Error(`${ method } ${ path }: ${ res.status } ${ await res.text() }`);
    }
    return res.status === 204 ? null : res.json().catch(() => null);
  };
  return {
    openMigrations: async () => {
      const mrs = await call('GET', '/merge_requests?state=opened&per_page=100');
      const branches = await call('GET', '/repository/branches?search=%5Emigrate%2F&per_page=100');
      const withMr = new Set(mrs.map(m => m.source_branch));
      return [
        ...mrs.filter(m => m.source_branch.startsWith('migrate/')).map(m => ({ branch: m.source_branch, mrIid: m.iid })),
        ...branches.filter(b => !withMr.has(b.name)).map(b => ({ branch: b.name })),
      ];
    },
    rejected: async () => {
      const mrs = await call('GET', '/merge_requests?state=closed&per_page=100');
      return new Set(mrs.filter(m => m.source_branch.startsWith('migrate/')).map(m => m.source_branch));
    },
    createBranch: (branch, ref) => call('POST', `/repository/branches?branch=${ encodeURIComponent(branch) }&ref=${ encodeURIComponent(ref) }`),
    deleteBranch: branch => call('DELETE', `/repository/branches/${ encodeURIComponent(branch) }`),
    note: (iid, body) => call('POST', `/merge_requests/${ iid }/notes`, { body }),
    closeMr: iid => call('PUT', `/merge_requests/${ iid }`, { state_event: 'close' }),
  };
}

async function main(argv) {
  const apply = argv.includes('--apply');
  const i = argv.indexOf('--group');
  const only = i >= 0 ? argv[i + 1].split(',') : null;
  const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
  const ctx = await createContext(pkg);

  const targets = [];
  for (const group of GROUPS.filter(g => !only || only.includes(g.id))) {
    const res = await newestGroupVersion(group, ctx);
    console.log(`${ group.id.padEnd(8) } installed ${ res.current }${ res.target ? ` -> eligible ${ res.target }` : ', nothing eligible' }`);
    for (const p of res.pending) {
      console.log(`         pending ${ p.version }: ${ p.reasons.slice(0, 4).join('; ') }${ p.reasons.length > 4 ? ` (+${ p.reasons.length - 4 })` : '' }`);
    }
    for (const c of res.plan?.changes ?? []) {
      console.log(`         ${ c.name } ${ c.from } -> ${ c.to }`);
    }
    if (res.target) {
      targets.push({ group: group.id, leader: group.leader, version: res.target });
    }
  }

  const api = apply ? gitlab() : null;
  const open = api ? await api.openMigrations() : [];
  const rejected = api ? await api.rejected() : new Set();
  const actions = decide(targets, open, rejected);
  const base = process.env.CI_DEFAULT_BRANCH || 'development';
  for (const a of actions) {
    console.log(`${ apply ? '' : '[dry-run] ' }${ a.type } ${ a.group } ${ a.branch }${ a.reason ? ` (${ a.reason })` : '' }`);
    if (!apply) {
      continue;
    }
    if (a.type === 'supersede') {
      if (a.old.mrIid) {
        await api.note(a.old.mrIid, `Superseded by \`${ a.branch }\` (framework watch: newer eligible version).`);
        await api.closeMr(a.old.mrIid);
      }
      await api.deleteBranch(a.old.branch);
    }
    if (a.type === 'create' || a.type === 'supersede') {
      await api.createBranch(a.branch, base);
    }
  }
  if (!actions.length) {
    console.log('nothing to migrate');
  }
  return 0;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exit(await main(process.argv.slice(2)));
}
