#!/usr/bin/env node
/**
 * Publishes the tarballs that `release.mjs --pack=<dir>` wrote (RELEASE_WORKFLOW.md "Releases in CI").
 *
 * Runs in the GitLab-hosted publish job WITHOUT a checkout or an install: release.mjs copies this file next to the
 * tarballs, so it may only import node built-ins. npm (>= 11.5.1) authenticates through trusted publishing itself
 * (NPM_ID_TOKEN of the job) and adds the provenance attestation.
 *
 *   node publish-tarballs.mjs <dir> [--dry-run]
 *
 * - no <dir>/manifest.json: nothing was released (the gate skipped or nothing changed) → exit 0
 * - a version that is already on the registry is skipped, so a retry of the job only publishes what is missing
 * - the rxap umbrella is only published when every package of the packages group is on the registry (its
 *   packageGroup pins those versions)
 * Env: NPM_BIN (default npm)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @param manifest { distTag, registry, packages: [{ group, name, version, file }] }
 * @param isPublished (name, version) => boolean
 * @returns [{ ...entry, action: 'publish' | 'skip' }]
 */
export function plan(manifest, isPublished) {
  return manifest.packages.map(p => ({ ...p, action: isPublished(p.name, p.version) ? 'skip' : 'publish' }));
}

/** the umbrella may only go out when no member of the packages group failed */
export const blockedByMembers = (entry, failed) => entry.group === 'rxap' && failed.some(f => f.group !== 'rxap');

export const publishArgs = (file, { distTag, registry }) =>
  [ 'publish', file, '--tag', distTag, '--access', 'public', '--registry', registry ];

async function publishedVersions(registry, name) {
  const res = await fetch(`${ registry.replace(/\/$/, '') }/${ name.replace('/', '%2f') }`, {
    headers: { accept: 'application/vnd.npm.install-v1+json' },
  });
  if (res.status === 404) {
    return new Set();
  }
  if (!res.ok) {
    throw new Error(`${ name }: registry answered ${ res.status }`);
  }
  return new Set(Object.keys((await res.json()).versions ?? {}));
}

async function main([ dirArg, ...argv ]) {
  if (!dirArg) {
    console.error('usage: publish-tarballs.mjs <dir> [--dry-run]');
    return 2;
  }
  const dryRun = argv.includes('--dry-run');
  const dir = resolve(dirArg);
  const manifestFile = join(dir, 'manifest.json');
  if (!existsSync(manifestFile)) {
    console.log('No manifest.json: nothing was released, nothing to publish.');
    return 0;
  }
  const manifest = JSON.parse(readFileSync(manifestFile, 'utf-8'));
  const known = new Map();
  for (const name of new Set(manifest.packages.map(p => p.name))) {
    known.set(name, await publishedVersions(manifest.registry, name));
  }
  const steps = plan(manifest, (name, version) => known.get(name).has(version));
  console.log(`${ steps.length } package(s) → ${ manifest.registry } @${ manifest.distTag }`);

  const npm = process.env.NPM_BIN || 'npm';
  const failed = [];
  for (const step of steps) {
    const id = `${ step.name }@${ step.version }`;
    if (step.action === 'skip') {
      console.log(`= ${ id } already published`);
      continue;
    }
    if (blockedByMembers(step, failed)) {
      console.error(`✗ ${ id } not published: member packages failed (retry the job)`);
      failed.push(step);
      continue;
    }
    const args = publishArgs(join(dir, step.file), manifest);
    console.log(`$ ${ npm } ${ args.join(' ') }`);
    if (dryRun) {
      continue;
    }
    const res = spawnSync(npm, args, { stdio: 'inherit' });
    if (res.status !== 0) {
      console.error(`✗ ${ id } failed (exit ${ res.status })`);
      failed.push(step);
    } else {
      console.log(`✔ ${ id }`);
    }
  }
  if (failed.length > 0) {
    console.error(`${ failed.length } package(s) not published: ${ failed.map(f => f.name).join(', ') } — retry the job`);
    return 1;
  }
  return 0;
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  process.exit(await main(process.argv.slice(2)));
}
