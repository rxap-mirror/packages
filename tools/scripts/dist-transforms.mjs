/**
 * Dist transforms applied to the built packages in dist/ before they are published (the former `prepack`).
 *
 * Shared by the release (`tools/scripts/release.mjs`, step 8) and the package-manager e2e matrix
 * (`tools/scripts/e2e-package-managers.mjs`), so the e2e run publishes exactly what a release would publish.
 *
 *   1. theme export          add `exports["./theme"]` to every Angular package that ships a theme.css
 *   2. strip workspace dep   remove the `workspace` marker dependency from every dist package.json
 *   3. strip ng-prism        run the `prism-strip` target of the given projects (removes the @Showcase decorators,
 *                            which import the dev-only @ng-prism/core); the build must already have run
 *   4. ng-prism guard        fail if anything in the dist of the given projects still references @ng-prism
 *
 * Steps 1 and 2 run in-process (no jq: the CI images do not ship it). Every step throws on failure — the caller
 * decides whether that aborts.
 */
import { execSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

/** default runner: echo the command, inherit stdio, throw on a non-zero exit */
function defaultRun(cmd) {
  console.log(`  $ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

/** every directory below `dir` (including `dir`) that contains a package.json */
function packageDirs(dir) {
  if (!existsSync(dir)) {
    return [];
  }
  const found = existsSync(join(dir, 'package.json')) ? [ dir ] : [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      found.push(...packageDirs(join(dir, entry.name)));
    }
  }
  return found;
}

function updateManifest(dir, update) {
  const file = join(dir, 'package.json');
  const manifest = JSON.parse(readFileSync(file, 'utf8'));
  if (update(manifest)) {
    writeFileSync(file, JSON.stringify(manifest, null, 2) + '\n');
  }
}

/** 1. `exports["./theme"] = "./theme.css"` for every Angular dist package that ships a theme.css */
export function addThemeExports(root = process.cwd()) {
  const dirs = packageDirs(join(root, 'dist/packages/angular')).filter((dir) => existsSync(join(dir, 'theme.css')));
  for (const dir of dirs) {
    updateManifest(dir, (manifest) => {
      manifest.exports = { ...(manifest.exports ?? {}), './theme': './theme.css' };
      return true;
    });
  }
  console.log(`  theme export: ${ dirs.length } package(s)`);
  return dirs;
}

/** 2. remove the `workspace` marker dependency from every dist package.json */
export function stripWorkspaceMarker(root = process.cwd()) {
  const stripped = [];
  for (const dir of packageDirs(join(root, 'dist/packages'))) {
    updateManifest(dir, (manifest) => {
      let changed = false;
      for (const field of [ 'dependencies', 'peerDependencies', 'devDependencies' ]) {
        if (manifest[field] && 'workspace' in manifest[field]) {
          delete manifest[field].workspace;
          changed = true;
        }
      }
      if (changed) {
        stripped.push(dir);
      }
      return changed;
    });
  }
  console.log(`  workspace marker removed from ${ stripped.length } package(s)`);
  return stripped;
}

/**
 * @param {object} options
 * @param {string[]} options.projects  Nx project names whose dist is transformed (prism-strip + guard)
 * @param {(cmd: string) => unknown} [options.run]  command runner; must throw on failure
 * @param {string} [options.root]  workspace root (dist/ lives below it)
 */
export function applyDistTransforms({ projects, run = defaultRun, root = process.cwd() }) {
  addThemeExports(root);
  stripWorkspaceMarker(root);
  // the @Showcase decorators import @ng-prism/core, which is not a dependency of the published packages.
  // Only projects with a prism-strip target (@rxap/plugin-ng-prism:init-library) run it; the build already ran.
  run(`pnpm nx run-many --targets=prism-strip --projects=${projects.join(',')} --excludeTaskDependencies --skip-nx-cache --nxBail`);
  // safety net: nothing that references @ng-prism may be published (a library without a prism-strip target,
  // a stale dist, a new file type). Fails before the publish step.
  run(`node tools/scripts/check-dist-for-ng-prism.mjs --projects=${projects.join(',')}`);
}
