/**
 * Release planning helpers shared by release.mjs (the orchestrator), release-ci.mjs (the CI gate) and
 * npm-trust.mjs (trusted-publisher setup). Pure functions take their inputs as arguments so they can be tested
 * without a git repository; the `read*` helpers do the I/O.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const semver = require('semver');

/** commit subjects written by release.mjs itself (pushed with `ci.skip`, never released on their own) */
export const RELEASE_COMMIT_SUBJECTS = [ 'chore(release): version', 'chore(release): version rxap', 'fix(rxap): update package group' ];
export const isReleaseCommit = subject => RELEASE_COMMIT_SUBJECTS.includes(subject?.trim());

/** git tag prefix of a project (nx.json release.groups.*.releaseTag.pattern) */
export const tagPrefix = name => name === 'rxap' ? 'rxap@' : `@rxap/${ name }@`;

const SKIP_DIRS = new Set([ 'node_modules', 'dist', '.git', '.nx', 'tmp', 'demos' ]);

/**
 * The publishable projects of a release group, read from the file tree (folders with project.json + package.json).
 * @returns [{ name, pkgName, disk, deps, root }]
 */
export function readGroupProjects(groupName, root = '.') {
  const found = [];
  const walk = dir => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name.startsWith('.') || SKIP_DIRS.has(e.name)) {
        continue;
      }
      const p = join(dir, e.name);
      const pj = join(p, 'project.json');
      const pk = join(p, 'package.json');
      if (existsSync(pj) && existsSync(pk)) {
        const project = JSON.parse(readFileSync(pj, 'utf-8'));
        const pkg = JSON.parse(readFileSync(pk, 'utf-8'));
        const inGroup = groupName === 'rxap'
          ? project.name === 'rxap'
          : (project.tags ?? []).includes('packages') && project.name !== 'rxap';
        if (inGroup && !pkg.private) {
          found.push({
            name: project.name,
            pkgName: pkg.name,
            disk: pkg.version,
            root: p,
            deps: Object.keys({ ...pkg.dependencies, ...pkg.peerDependencies, ...pkg.optionalDependencies, ...pkg.devDependencies }),
          });
        }
      }
      walk(p);
    }
  };
  walk(root);
  const seen = new Set();
  return found.filter(({ name }) => !seen.has(name) && seen.add(name));
}

/** all git tags of the repository */
export const readTags = (cwd = '.') => execFileSync('git', [ 'tag', '-l' ], { cwd, encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 })
  .split('\n').filter(Boolean);

/** adds `latestTag` (newest semver version tagged for the project) to each project */
export function withLatestTags(projects, tags) {
  const byPrefix = new Map();
  for (const t of tags) {
    const at = t.lastIndexOf('@');
    if (at > 0) {
      const prefix = t.slice(0, at + 1);
      const v = t.slice(at + 1);
      if (semver.valid(v)) {
        (byPrefix.get(prefix) ?? byPrefix.set(prefix, []).get(prefix)).push(v);
      }
    }
  }
  return projects.map(p => ({ ...p, latestTag: (byPrefix.get(tagPrefix(p.name)) ?? []).sort(semver.compare).at(-1) }));
}

/** the projects of a release group with their newest tag (release.mjs listReleaseProjects) */
export const listReleaseProjects = (groupName, { root = '.', tags = readTags(root) } = {}) => withLatestTags(readGroupProjects(groupName, root), tags);

/** a project is stamped when post-migrate raised its on-disk major above the newest tag (FRAMEWORK-WATCH.md) */
export const isStamped = p => !!p.latestTag && !!semver.valid(p.disk) && semver.major(p.disk) > semver.major(p.latestTag);

/**
 * --stamped plan: stamped projects at exactly their stamped version, their (transitive) dependents at a patch bump
 * (`prepatch` on a prerelease line: a ^24.0.0 range does not match 24.0.0-dev.0), the rest by conventional commits.
 * @param mode { isPrerelease, preid }
 * @returns { bySpecifier: Map<specifier, name[]>, rest: name[], lines: string[] }
 */
export function stampedPlan(projects, mode) {
  const bySpecifier = new Map();
  const lines = [];
  const add = (specifier, name) => (bySpecifier.get(specifier) ?? bySpecifier.set(specifier, []).get(specifier)).push(name);
  const released = new Set(); // npm names of the projects that get a new version
  let rest = [];
  for (const p of projects) {
    if (isStamped(p)) {
      const target = semver.prerelease(p.disk) || !mode.isPrerelease ? p.disk : `${ p.disk }-${ mode.preid }.0`;
      add(target, p.name);
      released.add(p.pkgName);
      lines.push(`stamped: ${ p.name.padEnd(38) } ${ p.latestTag } -> ${ target }`);
    } else {
      rest.push(p);
    }
  }
  for (let changed = true; changed;) {
    changed = false;
    rest = rest.filter(p => {
      if (!p.deps.some(d => released.has(d))) {
        return true;
      }
      const specifier = mode.isPrerelease ? 'prepatch' : 'patch';
      add(specifier, p.name);
      released.add(p.pkgName);
      changed = true;
      lines.push(`dependent: ${ p.name.padEnd(36) } ${ p.latestTag } -> ${ specifier }`);
      return false;
    });
  }
  return { bySpecifier, rest: rest.map(p => p.name), lines };
}

/**
 * git push arguments for a release: the branch tip and exactly this run's tags in one atomic push (works on a
 * detached HEAD, never pushes stale local tags); `ci.skip` keeps GitLab from starting pipelines for the release
 * commit and for every tag.
 */
export function pushArgs({ remote = 'origin', branch, tags, pushOptions = [ 'ci.skip' ] }) {
  return [
    'push', '--atomic',
    ...pushOptions.flatMap(o => [ '-o', o ]),
    remote,
    `HEAD:refs/heads/${ branch }`,
    ...[ ...new Set(tags) ].map(t => `refs/tags/${ t }:refs/tags/${ t }`),
  ];
}

/**
 * project.json files below a generated `docs/` folder. typedoc copies a relatively linked folder (e.g. a README link
 * to `../other-lib`) into `docs/**\/_media` — with its project.json, so Nx sees that project twice and may pick the
 * copy (the release then builds and packs the wrong folder).
 */
export function strayDocsProjects(root = process.cwd()) {
  const base = join(root, 'packages');
  if (!existsSync(base)) {
    return [];
  }
  return readdirSync(base, { recursive: true })
    .map(String)
    .filter((file) => !file.includes('node_modules') && /(^|\/)docs\/(.+\/)?project\.json$/.test(file))
    .map((file) => join('packages', file));
}
