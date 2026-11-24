// One-shot helper to realign every @rxap/* workspace dependency range to the
// current workspace package version. post-migrate.sh stamped source versions to
// the new framework majors but its fix-dependencies step crashed before
// updating dependent ranges, so the package manager installed stale published
// @rxap packages instead of linking source. pnpm (linkWorkspacePackages: deep)
// only links a workspace package whose version satisfies the range, so aligning
// the ranges lets `pnpm install` link all workspace packages again.
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

const files = execSync(
  "find packages -name package.json -not -path '*/node_modules/*'",
  { encoding: 'utf8' },
).trim().split('\n').filter(Boolean);

const version = {};
const parsed = [];
for (const file of files) {
  try {
    const json = JSON.parse(readFileSync(file, 'utf8'));
    if (json.name && json.version) {
      version[json.name] = json.version;
      parsed.push([ file, json ]);
    }
  } catch {
    /* skip unparseable */
  }
}

let changed = 0;
for (const [ file, json ] of parsed) {
  let modified = false;
  for (const field of [ 'dependencies', 'devDependencies', 'peerDependencies' ]) {
    const deps = json[field];
    if (!deps) {
      continue;
    }
    for (const dep of Object.keys(deps)) {
      if (version[dep]) {
        const want = `^${ version[dep] }`;
        if (deps[dep] !== want) {
          deps[dep] = want;
          modified = true;
        }
      }
    }
  }
  if (modified) {
    writeFileSync(file, `${ JSON.stringify(json, null, 2) }\n`);
    changed++;
  }
}

console.log(`aligned @rxap dependency ranges in ${ changed } package.json files (of ${ parsed.length } workspace packages)`);
