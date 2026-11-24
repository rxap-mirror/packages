#!/usr/bin/env node
/**
 * Release guard: fails when a built package in dist still references ng-prism.
 *
 * The `@Showcase` decorators import `@ng-prism/core`, which is a dev-only dependency of the workspace and
 * must never reach the consumers of a published package. The `prism-strip` target of every library removes
 * the decorators from the built package; this script verifies that nothing was missed (a library without a
 * prism-strip target, a new file type, a stale dist) BEFORE the package is published.
 *
 * Checked: code and manifests (.js .mjs .cjs .d.ts .d.mts .json). Not checked: source maps (they embed the
 * original sources, are never resolved by the consumer) and markdown files (changelogs mention ng-prism).
 *
 * Usage:
 *   node tools/scripts/check-dist-for-ng-prism.mjs --projects angular-components,angular-dialog
 *   node tools/scripts/check-dist-for-ng-prism.mjs dist/packages/angular/components
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PATTERN = '@ng-prism';
const CHECKED_FILE = /\.(?:c?m?js|d\.m?ts|json)$/;
// compodoc/typedoc output embeds the original source (incl. the @Showcase imports) as search-index text; it is
// documentation, never resolved or executed by a consumer
const SKIPPED_DIRECTORY = new Set(['node_modules', '.git', 'compodoc', 'typedoc']);

// Files that legitimately contain the string '@ng-prism/...' as DATA: the generators that add ng-prism as a
// dev dependency of the *user's* workspace (a string literal, not an import).
const ALLOWED_FILE = [
  /(?:^|\/)dist\/packages\/plugin\/ng-prism\/src\/generators\//,
  /(?:^|\/)dist\/packages\/plugin\/library\/src\/generators\/fix-dependencies\//,
];

/** project name -> project root, found by walking the workspace for project.json files */
function projectRoots() {
  const skip = new Set(['node_modules', 'dist', '.git', '.nx', '.yarn', 'tmp', 'coverage']);
  const roots = new Map();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.name.startsWith('.') || skip.has(entry.name)) {
        continue;
      }
      const path = join(dir, entry.name);
      const projectJson = join(path, 'project.json');
      if (existsSync(projectJson)) {
        try {
          const { name } = JSON.parse(readFileSync(projectJson, 'utf-8'));
          if (name) {
            roots.set(name, relative('.', path));
          }
        } catch {
          // an unreadable project.json is not this script's concern
        }
      }
      walk(path);
    }
  };
  walk('.');
  return roots;
}

/** the files below `dir` that reference ng-prism */
export function findOffenders(dir) {
  const offenders = [];
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        if (!SKIPPED_DIRECTORY.has(entry.name)) {
          walk(path);
        }
      } else if (
        CHECKED_FILE.test(entry.name) &&
        !ALLOWED_FILE.some((pattern) => pattern.test(path.split('\\').join('/'))) &&
        statSync(path).isFile() &&
        readFileSync(path, 'utf-8').includes(PATTERN)
      ) {
        offenders.push(path);
      }
    }
  };
  walk(dir);
  return offenders;
}

function parseArguments(argv) {
  const directories = [];
  let projects = [];
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--projects') {
      projects = (argv[++i] ?? '').split(',').filter(Boolean);
    } else if (argv[i].startsWith('--projects=')) {
      projects = argv[i].slice('--projects='.length).split(',').filter(Boolean);
    } else {
      directories.push(argv[i]);
    }
  }
  return { directories, projects };
}

function main(argv) {
  const { directories, projects } = parseArguments(argv);

  if (projects.length > 0) {
    const roots = projectRoots();
    for (const project of projects) {
      const root = roots.get(project);
      if (!root) {
        console.warn(`check-dist-for-ng-prism: project "${project}" not found, skipped`);
        continue;
      }
      directories.push(join('dist', root));
    }
  }

  if (directories.length === 0) {
    console.error('Usage: check-dist-for-ng-prism.mjs [--projects a,b,c] [dist-dir ...]');
    return 2;
  }

  let checked = 0;
  const failures = [];
  for (const directory of directories) {
    if (!existsSync(directory)) {
      // a project that was not built (e.g. private, or no build target) has no dist to check
      continue;
    }
    checked++;
    for (const file of findOffenders(directory)) {
      failures.push(file);
    }
  }

  if (failures.length > 0) {
    console.error(`✗ ${failures.length} file(s) in dist still reference ${PATTERN} (the prism-strip step is missing or failed):`);
    for (const file of failures) {
      console.error(`  - ${file}`);
    }
    return 1;
  }

  console.log(`✓ no ${PATTERN} reference in ${checked} built package(s)`);
  return 0;
}

// only run the CLI when executed directly, so the checks can be imported by the tests
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main(process.argv.slice(2)));
}
