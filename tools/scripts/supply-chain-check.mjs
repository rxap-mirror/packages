#!/usr/bin/env node
/**
 * Supply-chain gate for a lockfile change (run by the pre-push hook, later by CI and Renovate).
 *
 * 1. Cooldown: every package version that pnpm-lock.yaml resolves but the lockfile of <base-ref> does not must be
 *    older than the cooldown of its popularity tier (7/14/30 days, see audit-lockfile-cooldown.mjs). pnpm's
 *    `minimumReleaseAge` (pnpm-workspace.yaml) only enforces the flat 7-day floor.
 *    Versions listed in `minimumReleaseAgeExclude` (pnpm-workspace.yaml) are accepted; an entry below a comment
 *    `remove after YYYY-MM-DD` whose date has passed is a finding of its own.
 * 2. Vulnerabilities: `pnpm audit` must report no advisory of severity high or critical, except the ones listed in
 *    tools/scripts/audit-allowlist.json. Every allowlist entry has a reason and an expiry date; an expired entry is a
 *    finding of its own.
 *
 * Usage: node tools/scripts/supply-chain-check.mjs [<base-ref>] [--no-cooldown] [--no-audit]
 * <base-ref> defaults to the merge base with the upstream branch, else with origin/development.
 * Exit code 1 when anything is found.
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { auditLockfile, formatViolation } from './audit-lockfile-cooldown.mjs';

const require = createRequire(import.meta.url);
const YAML = require('yaml');

export const WORKSPACE_FILE = 'pnpm-workspace.yaml';
export const ALLOWLIST_FILE = 'tools/scripts/audit-allowlist.json';
export const FAILING_SEVERITIES = [ 'high', 'critical' ];

const defaultGit = (...args) => execFileSync('git', args, { encoding: 'utf8', stdio: [ 'ignore', 'pipe', 'ignore' ] }).trim();

/** the explicit ref, else the merge base with the upstream branch, else with origin/development */
export function resolveBase(explicit, git = defaultGit) {
  if (explicit) {
    return explicit;
  }
  for (const other of [ '@{upstream}', 'origin/development' ]) {
    try {
      return git('merge-base', 'HEAD', other);
    } catch {
      // no upstream configured / ref unknown: try the next one
    }
  }
  throw new Error('cannot determine the base ref: pass it as the first argument');
}

/**
 * The `minimumReleaseAgeExclude` entries of a pnpm-workspace.yaml, each with the `remove after YYYY-MM-DD` date of
 * the closest comment above it (null below a comment without a date, e.g. "permanent: ...").
 */
export function readExclusions(text) {
  const seq = YAML.parseDocument(text).get('minimumReleaseAgeExclude', true);
  const entries = [];
  let removeAfter = null;
  (seq?.items ?? []).forEach((item, i) => {
    const comment = [ i === 0 ? seq.commentBefore : '', item.commentBefore ].filter(Boolean).join('\n');
    if (comment) {
      removeAfter = /remove after (\d{4}-\d{2}-\d{2})/.exec(comment)?.[1] ?? null;
    }
    entries.push({ pattern: String(item.value ?? item), removeAfter });
  });
  return entries;
}

/** does a pnpm exclusion pattern (`name`, `@scope/*`, `name@1.0.0`, `name@1.0.0 || 2.0.0`) cover name@version */
export function excludes(pattern, name, version) {
  const at = pattern.lastIndexOf('@');
  const [ namePart, versions ] = at > 0 ? [ pattern.slice(0, at), pattern.slice(at + 1).split('||').map(v => v.trim()) ] : [ pattern, null ];
  const nameRe = new RegExp(`^${ namePart.split('*').map(p => p.replace(/[.+?^${}()|[\]\\/]/g, '\\$&')).join('.*') }$`);
  return nameRe.test(name) && (!versions || versions.includes(version));
}

/** split allowlist entries into the ones still valid on `today` (YYYY-MM-DD) and the expired ones */
export function partitionAllowlist(entries, today = new Date().toISOString().slice(0, 10)) {
  const active = [];
  const expired = [];
  for (const entry of entries) {
    if (!entry.id || !entry.reason || !/^\d{4}-\d{2}-\d{2}$/.test(entry.expires ?? '')) {
      throw new Error(`invalid allowlist entry (needs id, reason and expires YYYY-MM-DD): ${ JSON.stringify(entry) }`);
    }
    (entry.expires < today ? expired : active).push(entry);
  }
  return { active, expired };
}

/** the high/critical advisories of a `pnpm audit --json` report that are not allowlisted */
export function auditFindings(report, allowed = []) {
  const ignore = new Set(allowed.map(e => e.id));
  return Object.values(report?.advisories ?? {})
    .filter(a => FAILING_SEVERITIES.includes(a.severity))
    .filter(a => !ignore.has(a.github_advisory_id))
    .map(a => ({
      id: a.github_advisory_id,
      severity: a.severity,
      module: a.module_name,
      versions: [ ...new Set((a.findings ?? []).map(f => f.version)) ].join(','),
      patched: a.patched_versions ?? 'none',
      title: a.title,
    }))
    .sort((a, b) => a.module.localeCompare(b.module) || a.id.localeCompare(b.id));
}

function pnpmAudit() {
  const res = spawnSync('pnpm', [ 'audit', '--json' ], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  try {
    return JSON.parse(res.stdout);
  } catch {
    throw new Error(`pnpm audit did not return JSON (exit ${ res.status }): ${ res.stderr || res.stdout }`.slice(0, 2000));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const base = resolveBase(args.find(a => !a.startsWith('--')));
  let failed = false;

  if (!args.includes('--no-cooldown')) {
    console.log(`== cooldown (base ${ base })`);
    const today = new Date().toISOString().slice(0, 10);
    const exclusions = readExclusions(readFileSync(WORKSPACE_FILE, 'utf8'));
    const overdue = exclusions.filter(e => e.removeAfter && e.removeAfter < today);
    overdue.forEach(e => console.log(`EXPIRED EXCLUSION ${ e.pattern } (remove after ${ e.removeAfter }) in ${ WORKSPACE_FILE }`));
    const { violations } = await auditLockfile(base);
    const open = violations.filter(v => !exclusions.some(e => excludes(e.pattern, v.name, v.version)));
    open.forEach(v => console.log(formatViolation(v)));
    console.log(`${ open.length } cooldown violation(s), ${ violations.length - open.length } excluded, ${ overdue.length } expired exclusion(s)`);
    failed ||= open.length > 0 || overdue.length > 0;
  }

  if (!args.includes('--no-audit')) {
    console.log(`== vulnerabilities (${ FAILING_SEVERITIES.join('/') })`);
    const entries = existsSync(ALLOWLIST_FILE) ? JSON.parse(readFileSync(ALLOWLIST_FILE, 'utf8')) : [];
    const { active, expired } = partitionAllowlist(entries);
    expired.forEach(e => console.log(`EXPIRED ALLOWLIST ENTRY ${ e.id } (${ e.package ?? '?' }) expired ${ e.expires }: ${ e.reason }`));
    const findings = auditFindings(pnpmAudit(), active);
    findings.forEach(f => console.log(`VULNERABLE ${ f.severity } ${ f.module }@${ f.versions } ${ f.id } (patched: ${ f.patched }) ${ f.title }`));
    console.log(`${ findings.length } advisory(ies), ${ expired.length } expired allowlist entr(y/ies), ${ active.length } allowlisted`);
    failed ||= findings.length > 0 || expired.length > 0;
  }

  console.log(failed ? '\nsupply-chain check FAILED' : '\nsupply-chain check passed');
  process.exit(failed ? 1 : 0);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  await main();
}
