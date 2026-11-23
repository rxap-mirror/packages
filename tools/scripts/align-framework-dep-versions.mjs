// Align every per-package dependency (non-@rxap) to the root
// package.json version, preserving the existing range prefix. post-migrate.sh's
// fix-dependencies step (which normally does this via
// setDependencyVersionFromRootPackageJson) crashed before completing, leaving
// per-package @nx/* pinned to 20.5.0 and @angular/* peers on ^19.x. That made
// yarn install duplicate nx (nested 20.5.0/21.0.0 vs root 21.6.9), which breaks
// executor builds with cross-instance ExecutorContext type mismatches.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const root = JSON.parse(readFileSync('package.json', 'utf8'));
const rootVersion = { ...root.dependencies, ...root.devDependencies };

const files = execSync(
  "find packages -name package.json -not -path '*/node_modules/*'",
  { encoding: 'utf8' },
).trim().split('\n').filter(Boolean);

let changed = 0;
for (const file of files) {
  let json;
  try {
    json = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    continue;
  }
  let modified = false;
  for (const field of [ 'dependencies', 'devDependencies', 'peerDependencies' ]) {
    const deps = json[field];
    if (!deps) {
      continue;
    }
    for (const dep of Object.keys(deps)) {
      if (dep.startsWith('@rxap/')) {
        continue; // workspace packages handled by align-rxap-dep-ranges
      }
      const rootRange = rootVersion[dep];
      if (!rootRange) {
        continue;
      }
      const rootClean = rootRange.replace(/^[\^~]/, '');
      const current = deps[dep];
      let want;
      if (field === 'peerDependencies') {
        // Peers describe what consumers may install: floor at the major release (see
        // widenPeerDependencyRange in @rxap/plugin-library fix-dependencies). Keep intentionally wide ranges.
        const match = rootClean.match(/^(\d+)\.(\d+)\.\d+$/);
        if (!match || /[|>*\s]/.test(current)) {
          continue;
        }
        want = match[1] === '0' ? `^0.${ match[2] }.0` : `^${ match[1] }.0.0`;
      } else {
        // copy the root range verbatim: a different range (e.g. ^x vs x) would resolve separately and
        // let the package manager install a second, possibly un-vetted copy of the package
        want = rootRange;
      }
      if (current !== want) {
        deps[dep] = want;
        modified = true;
      }
    }
  }
  if (modified) {
    writeFileSync(file, `${ JSON.stringify(json, null, 2) }\n`);
    changed++;
  }
}

console.log(`aligned framework dependency versions in ${ changed } package.json files`);
