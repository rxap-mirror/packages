#!/usr/bin/env node
/**
 * Package-manager e2e matrix: do the published @rxap packages work for consumers on npm, yarn and pnpm?
 *
 *   1. registry   start Verdaccio on http://localhost:<port> (storage under tmp/e2e-pm/, never the real registry;
 *                 `@rxap/*` is NOT proxied to npmjs, so every @rxap package comes from this run)
 *   2. build      production build of every publishable project (release group `packages`)
 *   3. transform  the same dist transforms as the release (tools/scripts/dist-transforms.mjs)
 *   4. publish    `npm publish dist/<root> --tag e2e` to the local registry
 *   5. matrix     per package manager, in a fresh temp directory OUTSIDE the repository (so nothing resolves
 *                 from this workspace's node_modules):
 *                   create-nx-workspace --pm <pm> --preset apps --nxCloud skip
 *                   install the representative set (plugins, schematic-composer, nest-server, dialog) @e2e
 *                   nx g @rxap/plugin-workspace:init, @rxap/plugin-gitlab-ci:init,
 *                        @nx/angular:library + @rxap/plugin-angular:init-library
 *                   checks: no `yarn` in the lines the generators added (pm != yarn), root `packageManager`
 *                           unchanged, `nx run-many -t build` green, every installed package (and every
 *                           generator/executor implementation of the plugins) loads from the consumer root
 *   6. report     pm × check matrix on stdout + tmp/e2e-pm/report.{json,md}; exit 1 if a required cell failed
 *
 * Package managers: npm (the global one), yarn (berry, node-modules linker), pnpm, yarn-pnp (berry with the PnP
 * linker — informational only, its failures never fail the run). yarn and pnpm run through corepack at the pinned
 * versions below (cooldown-eligible releases), regardless of what is installed globally.
 *
 * Every consumer gets its own npm/yarn/pnpm cache under the run directory: the e2e packages are republished with
 * the same version on every run, a shared cache would serve the tarballs of an earlier run.
 *
 * Usage:
 *   node tools/scripts/e2e-package-managers.mjs [flags]
 *   yarn nx run workspace:e2e-pm [flags]
 *
 * Flags:
 *   --pm=<list>           package managers to test, comma separated (default npm,yarn,pnpm,yarn-pnp)
 *   --keep                keep the temp workspaces (path is printed) instead of deleting them
 *   --skip-build          do not build; publish the existing dist (it must be complete)
 *   --skip-publish        do not build or publish; reuse the packages already in the e2e registry storage
 *   --port=<n>            registry port (default 4873; must be free)
 *   --yarn-version=<v>    yarn berry version for the yarn / yarn-pnp cells (default below)
 *   --pnpm-version=<v>    pnpm version for the pnpm cell (default below)
 *   --verbose             stream every command's output (it always goes to tmp/e2e-pm/logs/)
 */
import { execSync, spawn } from 'node:child_process';
import { createWriteStream, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync, chmodSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyDistTransforms } from './dist-transforms.mjs';

// cooldown-eligible (>= 7 days public) versions on 2026-11-24 — bump them like any other dependency
const DEFAULT_YARN_VERSION = '4.18.1';
const DEFAULT_PNPM_VERSION = '12.21.0';

const PM_IDS = ['npm', 'yarn', 'pnpm', 'yarn-pnp'];
// informational cells never fail the run
const INFORMATIONAL = new Set(['yarn-pnp']);

const DEV_PACKAGES = [
  '@rxap/plugin-workspace',
  '@rxap/plugin-library',
  '@rxap/plugin-angular',
  '@rxap/plugin-nestjs',
  '@rxap/plugin-gitlab-ci',
  '@rxap/schematic-composer',
];
const RUNTIME_PACKAGES = ['@rxap/nest-server', '@rxap/dialog'];
const DIST_TAG = 'e2e';

// ---------------------------------------------------------------------------
// flags
// ---------------------------------------------------------------------------
const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const valueOf = (name) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);

const PMS = (valueOf('pm') ?? PM_IDS.join(',')).split(',').map((p) => p.trim()).filter(Boolean);
const KEEP = has('--keep');
const SKIP_PUBLISH = has('--skip-publish');
const SKIP_BUILD = has('--skip-build') || SKIP_PUBLISH;
const VERBOSE = has('--verbose');
const PORT = Number(valueOf('port') ?? 4873);
const YARN_VERSION = valueOf('yarn-version') ?? DEFAULT_YARN_VERSION;
const PNPM_VERSION = valueOf('pnpm-version') ?? DEFAULT_PNPM_VERSION;
const REGISTRY = `http://localhost:${PORT}`;

const C = {
  red: (s) => `\x1b[0;31m${s}\x1b[0m`,
  green: (s) => `\x1b[0;32m${s}\x1b[0m`,
  blue: (s) => `\x1b[0;34m${s}\x1b[0m`,
  yellow: (s) => `\x1b[0;33m${s}\x1b[0m`,
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
};
const log = (msg) => console.log(C.blue(`\n▶ ${msg}`));
const ok = (msg) => console.log(C.green(`✔ ${msg}`));
const warn = (msg) => console.warn(C.yellow(`⚠ ${msg}`));
const die = (msg) => {
  console.error(C.red(`✗ ${msg}`));
  cleanup();
  process.exit(1);
};

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const NX_VERSION = JSON.parse(readFileSync(join(ROOT, 'node_modules/nx/package.json'), 'utf-8')).version;

// repo-side state (registry storage, logs, report) — gitignored tmp/
const E2E_DIR = join(ROOT, 'tmp/e2e-pm');
const LOG_DIR = join(E2E_DIR, 'logs');
// consumer workspaces (created in main) — see createRunDir
let RUN_DIR;

// ---------------------------------------------------------------------------
// process helpers
// ---------------------------------------------------------------------------
const children = new Set();

/**
 * Run a command, its output goes to `logFile` (and the console with --verbose).
 * Resolves { code, output } — never rejects; `output` is the combined stdout+stderr.
 */
function exec(cmd, args, { cwd = ROOT, env = process.env, logFile, timeoutMs = 30 * 60_000 } = {}) {
  return new Promise((resolvePromise) => {
    mkdirSync(dirname(logFile), { recursive: true });
    const out = createWriteStream(logFile);
    out.write(`$ ${[cmd, ...args].join(' ')}\n# cwd: ${cwd}\n\n`);
    const child = spawn(cmd, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] });
    children.add(child);
    let output = '';
    const onData = (chunk) => {
      output += chunk;
      out.write(chunk);
      if (VERBOSE) process.stdout.write(chunk);
    };
    child.stdout.on('data', onData);
    child.stderr.on('data', onData);
    const timer = setTimeout(() => {
      onData(`\n# TIMEOUT after ${timeoutMs / 60_000} min\n`);
      child.kill('SIGKILL');
    }, timeoutMs);
    const done = (code) => {
      clearTimeout(timer);
      children.delete(child);
      out.end(`\n# exit code: ${code}\n`);
      resolvePromise({ code, output });
    };
    child.on('error', (e) => {
      onData(`\n# spawn error: ${e.message}\n`);
      done(127);
    });
    child.on('close', (code) => done(code ?? 1));
  });
}

let registryProcess;
function cleanup() {
  for (const child of children) child.kill('SIGTERM');
  if (registryProcess && registryProcess.exitCode === null) registryProcess.kill('SIGTERM');
  if (!KEEP && RUN_DIR && existsSync(RUN_DIR)) {
    rmSync(RUN_DIR, { recursive: true, force: true, maxRetries: 3 });
  }
}
async function isRegistryUp() {
  try {
    const res = await fetch(`${REGISTRY}/-/ping`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 1. registry
// ---------------------------------------------------------------------------
async function startRegistry(projects) {
  log(`Start Verdaccio on ${REGISTRY} (storage tmp/e2e-pm/verdaccio/storage)`);
  if (await isRegistryUp()) {
    die(`something already listens on ${REGISTRY} — stop it (e.g. workspace:local-registry) or pass --port=<free port>`);
  }
  const dir = join(E2E_DIR, 'verdaccio');
  const storage = join(dir, 'storage');
  if (!SKIP_PUBLISH) {
    // the e2e packages are republished with the same version on every run — drop the previous ones, keep the
    // proxied npmjs packages (the uplink cache makes the consumer installs fast)
    rmSync(join(storage, '@rxap'), { recursive: true, force: true });
  }
  mkdirSync(storage, { recursive: true });
  // .verdaccio/config.yml with an isolated storage and one change: the packages of this workspace are served ONLY
  // from this registry (never proxied, so a consumer can not silently get the npmjs version), every other package
  // — including @rxap packages that live in other repositories, e.g. @rxap/cli — is proxied to npmjs
  const local = (name) => `  '${name}':\n    access: $all\n    publish: $all\n    unpublish: $all\n`;
  const config = [
    `storage: ${storage}`,
    'auth:\n  htpasswd:\n    file: ./htpasswd',
    'uplinks:\n  npmjs:\n    url: https://registry.npmjs.org/\n    maxage: 60m',
    'packages:',
    ...projects.map((p) => local(p.pkgName)),
    `  '**':\n    access: $all\n    publish: $all\n    unpublish: $all\n    proxy: npmjs`,
    'max_body_size: 500mb',
    'logs:\n  type: stdout\n  format: pretty\n  level: warn',
    '',
  ].join('\n');
  writeFileSync(join(dir, 'config.yml'), config);
  // started directly instead of via `nx run workspace:local-registry`: the @nx/js:verdaccio executor points the
  // user's global npm/yarn config at the local registry while it runs and does not restore it on a hard kill
  const out = createWriteStream(join(LOG_DIR, 'verdaccio.log'));
  registryProcess = spawn(process.execPath, [join(ROOT, 'node_modules/verdaccio/bin/verdaccio'), '--config', join(dir, 'config.yml'), '--listen', `localhost:${PORT}`], {
    cwd: dir,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  registryProcess.stdout.pipe(out);
  registryProcess.stderr.pipe(out);
  for (let i = 0; i < 60; i++) {
    if (registryProcess.exitCode !== null) break;
    if (await isRegistryUp()) return ok(`Verdaccio is up (log: ${relative(ROOT, join(LOG_DIR, 'verdaccio.log'))})`);
    await new Promise((r) => setTimeout(r, 500));
  }
  die(`Verdaccio did not start — see ${join(LOG_DIR, 'verdaccio.log')}`);
}

// ---------------------------------------------------------------------------
// 2.–4. build, transform, publish
// ---------------------------------------------------------------------------
function run(cmd) {
  console.log(C.blue(`  $ ${cmd}`));
  try {
    execSync(cmd, { stdio: VERBOSE ? 'inherit' : ['ignore', 'ignore', 'inherit'], env: { ...process.env, NX_TUI: 'false' } });
  } catch {
    die(`command failed: ${cmd}`);
  }
}

/** publishable projects (release group `packages`, minus what the release does not build) with their roots */
function publishableProjects() {
  const graphFile = join(E2E_DIR, 'graph.json');
  execSync(`yarn nx graph --file=${graphFile}`, { stdio: 'ignore', env: { ...process.env, NX_TUI: 'false' } });
  const { graph } = JSON.parse(readFileSync(graphFile, 'utf-8'));
  return Object.values(graph.nodes)
    .filter((n) => (n.data.tags ?? []).includes('packages') && !['rxap', 'angular'].includes(n.name) && !n.data.root.startsWith('demos/'))
    .map((n) => ({ name: n.name, root: n.data.root, pkgName: JSON.parse(readFileSync(join(ROOT, n.data.root, 'package.json'), 'utf-8')).name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function buildAndPublish(projects) {
  const names = projects.map((p) => p.name);
  if (!SKIP_BUILD) {
    log(`Production build of ${projects.length} publishable projects`);
    run(`yarn nx run-many --targets=build --configuration=production --projects=${names.join(',')} --nxBail`);
  } else {
    warn('Skipping the build (--skip-build): publishing the existing dist.');
  }

  log('Dist transforms (shared with the release)');
  applyDistTransforms({ projects: names, run });

  log(`Publish ${projects.length} packages → ${REGISTRY} @${DIST_TAG}`);
  const npmrc = join(E2E_DIR, 'publish.npmrc');
  // a dummy token: Verdaccio allows anonymous publishes ($all), npm refuses to publish without any token. The
  // dedicated userconfig also keeps the real ~/.npmrc (and its npmjs token) out of this run.
  writeFileSync(npmrc, `registry=${REGISTRY}/\n//localhost:${PORT}/:_authToken=e2e-local-registry\n`);
  const env = { ...process.env, npm_config_userconfig: npmrc, npm_config_registry: `${REGISTRY}/`, npm_config_cache: join(RUN_DIR, 'cache/npm-publish') };
  const failed = [];
  const queue = [...projects];
  await Promise.all(
    Array.from({ length: 8 }, async () => {
      for (let p = queue.shift(); p; p = queue.shift()) {
        const dist = join(ROOT, 'dist', p.root);
        if (!existsSync(join(dist, 'package.json'))) {
          failed.push(`${p.name}: no dist/${p.root}/package.json`);
          continue;
        }
        const { code } = await exec('npm', ['publish', dist, '--tag', DIST_TAG, '--registry', `${REGISTRY}/`, '--access', 'public'], {
          env,
          logFile: join(LOG_DIR, 'publish', `${p.name}.log`),
          timeoutMs: 5 * 60_000,
        });
        if (code !== 0) failed.push(`${p.name}: npm publish exited with ${code} (logs/publish/${p.name}.log)`);
      }
    }),
  );
  if (failed.length > 0) {
    die(`publishing to the e2e registry failed:\n  - ${failed.join('\n  - ')}`);
  }
  ok(`Published ${projects.length} packages.`);
}

// ---------------------------------------------------------------------------
// 5. consumer matrix
// ---------------------------------------------------------------------------
const CHECKS = [
  ['create', 'create-nx-workspace'],
  ['install', 'install @rxap plugins'],
  ['g-workspace-init', 'g plugin-workspace:init'],
  ['g-gitlab-ci-init', 'g plugin-gitlab-ci:init'],
  ['g-angular-lib', 'g @nx/angular:library'],
  ['g-angular-init-library', 'g plugin-angular:init-library'],
  ['install-runtime', 'add nest-server + dialog'],
  ['no-yarn', 'no yarn in generated files'],
  ['package-manager', 'packageManager unchanged'],
  ['build', 'nx run-many -t build'],
  ['load', 'packages + generators load'],
];

/** the CLI flavour of each matrix column */
function pmSpec(id) {
  switch (id) {
    case 'npm':
      return { id, pm: 'npm', add: (dev, pkgs) => ['npm', ['install', ...(dev ? ['--save-dev'] : []), ...pkgs]], install: ['npm', ['install']], nx: ['npx', ['nx']], node: ['node', []] };
    case 'pnpm':
      return { id, pm: 'pnpm', add: (dev, pkgs) => ['pnpm', ['add', ...(dev ? ['-D'] : []), ...pkgs]], install: ['pnpm', ['install']], nx: ['pnpm', ['exec', 'nx']], node: ['node', []] };
    case 'yarn':
    case 'yarn-pnp':
      return { id, pm: 'yarn', add: (dev, pkgs) => ['yarn', ['add', ...(dev ? ['-D'] : []), ...pkgs]], install: ['yarn', ['install']], nx: ['yarn', ['nx']], node: ['yarn', ['node']] };
  }
}

/** env of a consumer: nothing of this workspace's yarn/nx/npm config, the local registry, isolated caches */
function consumerEnv(spec, cellDir) {
  const env = {};
  for (const [k, v] of Object.entries(process.env)) {
    // also the agent markers: create-nx-workspace switches to an "AI agent mode" when it detects one
    if (/^(npm_|pnpm_|yarn_|berry_|nx_|corepack_|claude|init_cwd$|project_cwd$|ci$)/i.test(k)) continue;
    if (k === 'NODE_OPTIONS' && /pnp/.test(v)) continue;
    env[k] = v;
  }
  // drop PATH entries of this workspace (node_modules/.bin, the yarn 3.6 shim of `yarn run`)
  const path = (process.env.PATH ?? '').split(delimiter).filter((p) => p && !p.startsWith(ROOT) && !/\/xfs-[^/]+$/.test(p));
  const cache = join(cellDir, 'cache');
  const npmrc = join(cellDir, '.npmrc-e2e');
  writeFileSync(npmrc, `registry=${REGISTRY}/\n`);
  Object.assign(env, {
    PATH: [join(RUN_DIR, 'bin'), ...path].join(delimiter),
    // npm (and npx for create-nx-workspace)
    npm_config_userconfig: npmrc,
    npm_config_registry: `${REGISTRY}/`,
    npm_config_cache: join(cache, 'npm'),
    npm_config_update_notifier: 'false',
    npm_config_fund: 'false',
    npm_config_audit: 'false',
    // pnpm (reads pnpm_config_* since v11, npm_config_* before)
    pnpm_config_registry: `${REGISTRY}/`,
    npm_config_store_dir: join(cache, 'pnpm-store'),
    pnpm_config_store_dir: join(cache, 'pnpm-store'),
    npm_config_cache_dir: join(cache, 'pnpm'),
    pnpm_config_cache_dir: join(cache, 'pnpm'),
    // the e2e packages were published seconds ago — a release-age gate would reject them
    npm_config_minimum_release_age: '0',
    pnpm_config_minimum_release_age: '0',
    pnpm_config_frozen_lockfile: 'false',
    // pnpm >= 10 does not run dependency build scripts (nx, @swc/core, ...) unless approved, pnpm >= 11 fails the
    // install on them — a consumer approves them once; npm and yarn run them anyway
    pnpm_config_dangerously_allow_all_builds: 'true',
    npm_config_dangerously_allow_all_builds: 'true',
    npm_config_frozen_lockfile: 'false',
    // yarn berry
    YARN_NPM_REGISTRY_SERVER: REGISTRY,
    YARN_UNSAFE_HTTP_WHITELIST: 'localhost',
    YARN_NODE_LINKER: spec.id === 'yarn-pnp' ? 'pnp' : 'node-modules',
    YARN_ENABLE_GLOBAL_CACHE: 'false',
    YARN_CACHE_FOLDER: join(cache, 'yarn'),
    YARN_ENABLE_IMMUTABLE_INSTALLS: 'false',
    YARN_ENABLE_TELEMETRY: '0',
    YARN_ENABLE_PROGRESS_BARS: 'false',
    YARN_ENABLE_HYPERLINKS: '0',
    YARN_NPM_MINIMAL_AGE_GATE: '0',
    // corepack runs the pinned yarn/pnpm; it must not write a packageManager field on its own
    COREPACK_ENABLE_STRICT: '0',
    COREPACK_ENABLE_AUTO_PIN: '0',
    COREPACK_ENABLE_DOWNLOAD_PROMPT: '0',
    // nx
    NX_DAEMON: 'false',
    NX_TUI: 'false',
    NX_NO_CLOUD: 'true',
    NX_INTERACTIVE: 'false',
  });
  return env;
}

/** yarn/pnpm shims that pin the versions via corepack */
function writeShims() {
  const bin = join(RUN_DIR, 'bin');
  mkdirSync(bin, { recursive: true });
  for (const [name, version] of [['yarn', YARN_VERSION], ['pnpm', PNPM_VERSION]]) {
    const file = join(bin, name);
    writeFileSync(file, `#!/bin/sh\nexec corepack ${name}@${version} "$@"\n`);
    chmodSync(file, 0o755);
  }
}

// collects the `+` lines of a unified diff that mention yarn, per file (lockfiles excluded)
export function yarnHits(diff) {
  const hits = [];
  let file;
  let line = 0;
  for (const l of diff.split('\n')) {
    if (l.startsWith('+++ ')) {
      file = l.slice(4).replace(/^b\//, '');
    } else if (l.startsWith('@@')) {
      line = Number(/\+(\d+)/.exec(l)?.[1] ?? 0);
    } else if (l.startsWith('+')) {
      if (file && !/(^|\/)(yarn\.lock|package-lock\.json|pnpm-lock\.yaml)$/.test(file) && /\byarn\b/i.test(l)) {
        hits.push(`${file}:${line}: ${l.slice(1).trim().slice(0, 160)}`);
      }
      line++;
    } else if (!l.startsWith('-')) {
      line++;
    }
  }
  return hits;
}

const LOAD_CHECK = `'use strict';
// written by tools/scripts/e2e-package-managers.mjs — loads every package and every generator/executor implementation
const path = require('node:path');
const fs = require('node:fs');
const first = (e) => String(e && e.message || e).split('\\n')[0].slice(0, 300);
// a missing module that is a declared peer dependency is the consumer's job to install (yarn does not install peers)
const isPeer = (manifest, e) => {
  const m = /Cannot find (?:module|package) '((?:@[^/']+\\/)?[^/']+)/.exec(String(e && e.message || e));
  return !!m && !!manifest.peerDependencies && m[1] in manifest.peerDependencies;
};
(async () => {
  const results = [];
  for (const name of JSON.parse(process.argv[2])) {
    const errors = [];
    const peers = [];
    let dir;
    try {
      dir = path.dirname(require.resolve(name + '/package.json'));
    } catch (e) {
      results.push({ name, errors: ['resolve: ' + first(e)] });
      continue;
    }
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'));
    if (manifest.main || manifest.module || manifest.exports) {
      // partially compiled Angular libraries need the JIT compiler to be evaluated outside of an Angular build
      if (manifest.peerDependencies && manifest.peerDependencies['@angular/core']) {
        try { await import('@angular/compiler'); } catch {}
      }
      try { await import(name); } catch (e) { (isPeer(manifest, e) ? peers : errors).push('import: ' + first(e)); }
    }
    const seen = new Set();
    for (const key of ['generators', 'schematics', 'executors', 'builders']) {
      if (!manifest[key]) continue;
      const file = path.join(dir, manifest[key]);
      if (seen.has(file)) continue; // "schematics" usually points at the generators collection
      seen.add(file);
      let collection;
      try { collection = JSON.parse(fs.readFileSync(file, 'utf-8')); } catch (e) { errors.push(key + ': ' + manifest[key] + ' is not in the package: ' + first(e)); continue; }
      const entries = Object.assign({}, collection.generators, collection.schematics, collection.executors, collection.builders);
      for (const [id, entry] of Object.entries(entries)) {
        const impl = entry.factory || entry.implementation;
        if (!impl) continue;
        try { require(path.resolve(path.dirname(file), impl.split('#')[0])); } catch (e) { (isPeer(manifest, e) ? peers : errors).push(key + ':' + id + ': ' + first(e)); }
      }
    }
    results.push({ name, errors, peers });
  }
  console.log('__E2E_LOAD__' + JSON.stringify(results));
  process.exit(0);
})();
`;

async function runCell(id) {
  const spec = pmSpec(id);
  const cellDir = join(RUN_DIR, id);
  mkdirSync(cellDir, { recursive: true });
  const env = consumerEnv(spec, cellDir);
  const ws = join(cellDir, 'ws');
  const logs = join(LOG_DIR, id);
  rmSync(logs, { recursive: true, force: true });
  const cell = { pm: id, informational: INFORMATIONAL.has(id), workspace: ws, results: {} };
  let n = 0;
  const set = (check, status, detail = '', logFile) => {
    cell.results[check] = { status, detail, log: logFile ? relative(ROOT, logFile) : undefined };
    const mark = status === 'pass' ? C.green('✔') : status === 'fail' ? C.red('✗') : C.dim('–');
    console.log(`  ${mark} [${id}] ${check}${detail && status !== 'pass' ? C.dim(` — ${detail.split('\n')[0]}`) : ''}`);
  };
  const ok_ = (check) => cell.results[check]?.status === 'pass';
  /** run a step; `needs` must all have passed, else the step is skipped */
  const step = async (check, cmd, args, { needs = [], cwd = ws, timeoutMs } = {}) => {
    const blocked = needs.find((c) => !ok_(c));
    if (blocked) {
      set(check, 'skip', `needs ${blocked}`);
      return undefined;
    }
    const logFile = join(logs, `${String(++n).padStart(2, '0')}-${check}.log`);
    const res = await exec(cmd, args, { cwd, env, logFile, timeoutMs });
    const tail = res.output.split('\n').map((l) => l.trim()).filter(Boolean).slice(-3).join(' | ');
    set(check, res.code === 0 ? 'pass' : 'fail', res.code === 0 ? '' : `exit ${res.code}: ${tail}`, logFile);
    return res;
  };

  log(`[${id}] consumer workspace ${ws}`);

  // create — --workspaces=false: an integrated (project.json) workspace, the layout the rxap plugins target and the
  // only one @nx/angular:library supports; --skipGit: the baseline commit below is ours, taken after the install
  await step('create', 'npx', ['-y', `create-nx-workspace@${NX_VERSION}`, 'ws', '--pm', spec.pm, '--preset', 'apps', '--workspaces=false', '--nxCloud', 'skip', '--aiAgents=none', '--no-interactive', '--skipGit'], {
    cwd: cellDir,
  });
  const readPackageManager = () => {
    try {
      return JSON.parse(readFileSync(join(ws, 'package.json'), 'utf-8')).packageManager ?? null;
    } catch {
      return undefined;
    }
  };
  const packageManagerBefore = readPackageManager();

  // install
  const at = (pkgs) => pkgs.map((p) => `${p}@${DIST_TAG}`);
  const [devCmd, devArgs] = spec.add(true, [...at(DEV_PACKAGES), `@nx/angular@${NX_VERSION}`]);
  await step('install', devCmd, devArgs, { needs: ['create'] });

  // baseline commit: the no-yarn check only looks at what the generators add
  if (ok_('install')) {
    const git = (args) => execSync(`git ${args}`, { cwd: ws, stdio: 'ignore', env });
    git('init -q');
    git('add -A');
    git('-c user.name=e2e -c user.email=e2e@localhost commit -q --no-verify -m baseline');
  }

  const [nxCmd, nxArgs] = spec.nx;
  const nx = (...args) => [nxCmd, [...nxArgs, ...args]];
  await step('g-workspace-init', ...nx('g', '@rxap/plugin-workspace:init', '--no-interactive'), { needs: ['install'] });
  await step('g-gitlab-ci-init', ...nx('g', '@rxap/plugin-gitlab-ci:init', '--no-interactive'), { needs: ['install'] });
  await step('g-angular-lib', ...nx('g', '@nx/angular:library', 'libs/demo', '--name=demo', '--buildable', '--no-interactive'), { needs: ['install'] });
  await step('g-angular-init-library', ...nx('g', '@rxap/plugin-angular:init-library', '--project=demo', '--no-interactive'), { needs: ['g-angular-lib'] });
  // the runtime libraries come after the generators, as in a real workspace: adding @rxap/dialog first would pull
  // the newest Angular through its peers and conflict with the version @nx/angular:library pins. The add also
  // installs whatever the generators wrote into package.json.
  const [rtCmd, rtArgs] = spec.add(false, at(RUNTIME_PACKAGES));
  await step('install-runtime', rtCmd, rtArgs, { needs: ['install'] });

  // no `yarn` in the lines the generators added (only when the consumer does not use yarn)
  if (!ok_('install')) {
    set('no-yarn', 'skip', 'needs install');
  } else if (spec.pm === 'yarn') {
    set('no-yarn', 'skip', 'n/a for yarn');
  } else {
    execSync('git add -A', { cwd: ws, stdio: 'ignore', env });
    const diff = execSync('git diff --cached -U0 --no-color HEAD', { cwd: ws, encoding: 'utf-8', env, maxBuffer: 256 * 1024 * 1024 });
    const hits = yarnHits(diff);
    const logFile = join(logs, 'no-yarn.log');
    writeFileSync(logFile, hits.join('\n') + '\n');
    set('no-yarn', hits.length === 0 ? 'pass' : 'fail', `${hits.length} line(s) mention yarn:\n${hits.slice(0, 15).join('\n')}`, logFile);
  }

  // packageManager unchanged
  if (!ok_('create')) {
    set('package-manager', 'skip', 'needs create');
  } else {
    const after = readPackageManager();
    set('package-manager', after === packageManagerBefore ? 'pass' : 'fail', `${JSON.stringify(packageManagerBefore)} → ${JSON.stringify(after)}`);
  }

  await step('build', ...nx('run-many', '-t', 'build', '--outputStyle=static'), { needs: ['install'] });

  // load check
  if (!ok_('install')) {
    set('load', 'skip', 'needs install');
  } else {
    writeFileSync(join(ws, 'e2e-load-check.cjs'), LOAD_CHECK);
    const [nodeCmd, nodeArgs] = spec.node;
    const logFile = join(logs, `${String(++n).padStart(2, '0')}-load.log`);
    const res = await exec(nodeCmd, [...nodeArgs, 'e2e-load-check.cjs', JSON.stringify([...DEV_PACKAGES, ...RUNTIME_PACKAGES])], { cwd: ws, env, logFile, timeoutMs: 10 * 60_000 });
    const line = res.output.split('\n').find((l) => l.startsWith('__E2E_LOAD__'));
    if (!line) {
      set('load', 'fail', `load check crashed (exit ${res.code})`, logFile);
    } else {
      const results = JSON.parse(line.slice('__E2E_LOAD__'.length));
      const broken = results.filter((r) => r.errors.length > 0);
      const peerOnly = results.filter((r) => r.errors.length === 0 && r.peers?.length > 0).map((r) => r.name);
      const detail = broken.flatMap((r) => r.errors.map((e) => `${r.name} ${e}`));
      cell.load = results;
      if (peerOnly.length > 0) console.log(C.yellow(`  ⚠ [${id}] load: missing declared peer dependencies (not a failure) in ${peerOnly.join(', ')}`));
      set('load', broken.length === 0 ? 'pass' : 'fail', `${broken.length}/${results.length} packages fail to load:\n${detail.slice(0, 20).join('\n')}${detail.length > 20 ? `\n… ${detail.length - 20} more (see log)` : ''}`, logFile);
    }
  }
  return cell;
}

// ---------------------------------------------------------------------------
// 6. report
// ---------------------------------------------------------------------------
function report(cells) {
  const sym = { pass: '✔', fail: '✗', skip: '–' };
  const head = ['check', ...cells.map((c) => (c.informational ? `${c.pm} (info)` : c.pm))];
  const rows = CHECKS.map(([key, label]) => [label, ...cells.map((c) => sym[c.results[key]?.status ?? 'skip'])]);
  const widths = head.map((h, i) => Math.max(h.length, ...rows.map((r) => r[i].length)));
  const fmt = (r) => r.map((v, i) => v.padEnd(widths[i])).join('  ');
  log('Package-manager matrix');
  console.log(fmt(head));
  console.log(widths.map((w) => '─'.repeat(w)).join('  '));
  for (const r of rows) {
    const colored = fmt(r).replaceAll('✔', C.green('✔')).replaceAll('✗', C.red('✗'));
    console.log(colored);
  }

  const failures = cells.flatMap((c) =>
    CHECKS.filter(([key]) => c.results[key]?.status === 'fail').map(([key, label]) => ({ pm: c.pm, informational: c.informational, check: key, label, ...c.results[key] })),
  );
  if (failures.length > 0) {
    log('Failures');
    for (const f of failures) {
      console.log(`${f.informational ? C.yellow('(info)') : C.red('✗')} [${f.pm}] ${f.label}${f.log ? C.dim(`  (${f.log})`) : ''}`);
      for (const l of f.detail.split('\n').slice(0, 22)) console.log(`    ${l}`);
    }
  }

  const md = [
    `# Package-manager e2e matrix (${new Date().toISOString()})`,
    '',
    `nx ${NX_VERSION}, yarn ${YARN_VERSION}, pnpm ${PNPM_VERSION}, npm ${execSync('npm --version', { encoding: 'utf-8' }).trim()}`,
    '',
    `| ${head.join(' | ')} |`,
    `| ${head.map(() => '---').join(' | ')} |`,
    ...rows.map((r) => `| ${r.join(' | ')} |`),
    '',
    ...failures.flatMap((f) => [`## ${f.pm}: ${f.label}${f.informational ? ' (informational)' : ''}`, '', f.log ? `log: \`${f.log}\`` : '', '', '```', f.detail, '```', '']),
  ].join('\n');
  writeFileSync(join(E2E_DIR, 'report.md'), md);
  writeFileSync(join(E2E_DIR, 'report.json'), JSON.stringify({ nx: NX_VERSION, yarn: YARN_VERSION, pnpm: PNPM_VERSION, cells }, null, 2));
  console.log(C.dim(`\nreport: tmp/e2e-pm/report.md, tmp/e2e-pm/report.json, logs: tmp/e2e-pm/logs/`));
  return failures.filter((f) => !f.informational).length;
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------
async function main() {
  const unknownPms = PMS.filter((p) => !PM_IDS.includes(p));
  if (unknownPms.length > 0 || PMS.length === 0) {
    die(`--pm: unknown package manager(s) ${unknownPms.join(', ')} (known: ${PM_IDS.join(', ')})`);
  }
  process.chdir(ROOT);
  // consumer workspaces must live outside the repository: node resolution walks up the directory tree and would
  // find this workspace's node_modules, hiding every undeclared dependency
  RUN_DIR = mkdtempSync(join(tmpdir(), 'rxap-e2e-pm-'));
  if (!relative(ROOT, RUN_DIR).startsWith('..')) {
    die(`the temp directory ${RUN_DIR} is inside the repository — set TMPDIR to a directory outside of it`);
  }
  process.on('SIGINT', () => die('interrupted'));
  process.on('SIGTERM', () => die('terminated'));
  mkdirSync(LOG_DIR, { recursive: true });
  console.log(C.dim(`run directory: ${RUN_DIR}`));
  const projects = publishableProjects();
  await startRegistry(projects);
  if (SKIP_PUBLISH) {
    warn('Skipping build and publish (--skip-publish): using the packages already in the e2e registry.');
  } else {
    await buildAndPublish(projects);
  }
  writeShims();
  const cells = [];
  // sequential: every cell builds an Angular library, running them in parallel only thrashes the machine
  for (const id of PMS) cells.push(await runCell(id));
  const failed = report(cells);
  if (KEEP) console.log(C.yellow(`kept the consumer workspaces in ${RUN_DIR}`));
  cleanup();
  if (failed > 0) {
    console.error(C.red(`\n✗ ${failed} required check(s) failed.`));
    process.exit(1);
  }
  ok('All required checks passed.');
  process.exit(0);
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((e) => {
    console.error(e);
    die(`e2e failed: ${e?.message ?? e}`);
  });
}
