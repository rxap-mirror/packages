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
 * - publishes PUBLISH_CONCURRENCY packages at once (default 8): npm exchanges the job's OIDC ID token per publish,
 *   and the registry stopped accepting it ~5 minutes into the job (bootstrap 2026-11-26: 42 of 125 published
 *   one by one, then ENEEDAUTH for the rest). Each npm run is logged verbosely; the log is printed only on failure.
 * Env: NPM_BIN (default npm), PUBLISH_CONCURRENCY
 */
import { spawn } from 'node:child_process';
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

/**
 * A failure worth retrying: the Sigstore transparency log (rekor) answered 5xx — npm then retries itself, gets 409
 * for the entry its first attempt already wrote, and gives up (TLOG_CREATE_ENTRY_ERROR; bootstrap 2026-11-26: 23 of
 * 126) — or the network dropped. A retry signs again and writes a new entry.
 */
export const isTransient = (output) =>
  /TLOG_CREATE_ENTRY_ERROR|code E5\d\d|ETIMEDOUT|ECONNRESET|EAI_AGAIN|socket hang up/.test(output);

/** run a command, collect stdout + stderr in one string */
function runCaptured(cmd, args) {
  return new Promise((done) => {
    const child = spawn(cmd, args, { stdio: [ 'ignore', 'pipe', 'pipe' ] });
    let output = '';
    child.stdout.on('data', (chunk) => (output += chunk));
    child.stderr.on('data', (chunk) => (output += chunk));
    child.on('error', (error) => done({ status: 1, output: `${ output }\n${ error.message }` }));
    child.on('close', (status) => done({ status, output }));
  });
}

/**
 * Publish the `packages` group `concurrency` at a time, then the umbrella (only when no member failed).
 * @param steps from plan()
 * @param publishOne async (step) => boolean
 * @returns the failed steps
 */
export async function publishAll(steps, publishOne, concurrency = 8) {
  const failed = [];
  const id = (step) => `${ step.name }@${ step.version }`;
  const runStep = async (step) => {
    if (await publishOne(step)) {
      console.log(`✔ ${ id(step) }`);
    } else {
      console.error(`✗ ${ id(step) } failed`);
      failed.push(step);
    }
  };
  for (const step of steps.filter((s) => s.action === 'skip')) {
    console.log(`= ${ id(step) } already published`);
  }
  const todo = steps.filter((s) => s.action === 'publish');
  const members = todo.filter((s) => s.group !== 'rxap');
  const queue = [ ...members ];
  await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      await runStep(queue.shift());
    }
  }));
  for (const step of todo.filter((s) => s.group === 'rxap')) {
    if (blockedByMembers(step, failed)) {
      console.error(`✗ ${ id(step) } not published: member packages failed (retry the job)`);
      failed.push(step);
    } else {
      await runStep(step);
    }
  }
  return failed;
}

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
  const concurrency = Number(process.env.PUBLISH_CONCURRENCY) || 8;
  const publishOne = async (step) => {
    const args = [ ...publishArgs(join(dir, step.file), manifest), '--loglevel', 'verbose' ];
    if (dryRun) {
      console.log(`$ ${ npm } ${ args.join(' ') }`);
      return true;
    }
    let result = await runCaptured(npm, args);
    for (let attempt = 1; result.status !== 0 && attempt <= 2 && isTransient(result.output); attempt++) {
      console.error(`↻ ${ step.name }@${ step.version }: transient failure, retry ${ attempt } in ${ 10 * attempt } s`);
      await new Promise((r) => setTimeout(r, 10_000 * attempt));
      result = await runCaptured(npm, args);
    }
    if (result.status !== 0) {
      console.error(`--- npm output for ${ step.name }@${ step.version } ---\n${ result.output.trim() }\n---`);
    }
    return result.status === 0;
  };
  const started = Date.now();
  const failed = await publishAll(steps, publishOne, concurrency);
  console.log(`done in ${ Math.round((Date.now() - started) / 1000) } s`);
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
