#!/usr/bin/env node
/**
 * Sunset helper for the packages listed in tools/scripts/sunset-packages.json.
 *
 *   node tools/scripts/deprecate-packages.mjs projects
 *       print the comma-separated project list for
 *       `node tools/scripts/release.mjs --final --projects=<list>` (entries with finalRelease: true)
 *
 *   node tools/scripts/deprecate-packages.mjs deprecate [--dry-run]
 *       run `npm deprecate <package> "Deprecated: <message>"` for every entry (all versions).
 *       Needs an npm login with publish rights. Already deprecated packages with the same message
 *       are skipped.
 *
 *   node tools/scripts/deprecate-packages.mjs check
 *       show the registry state (latest dist-tag + deprecation message) of every entry
 */

import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const entries = JSON.parse(readFileSync(join(here, 'sunset-packages.json'), 'utf-8'));
const [command, ...flags] = process.argv.slice(2);
const DRY_RUN = flags.includes('--dry-run');

const deprecationMessage = (entry) => `Deprecated: ${entry.message}`;

function view(pkg) {
  const res = spawnSync('npm', ['view', pkg, 'dist-tags.latest', 'deprecated', '--json', '--prefer-online'], { encoding: 'utf-8' });
  if (res.status !== 0) return { error: (res.stderr || res.stdout).trim().split('\n')[0] };
  const out = res.stdout.trim();
  if (!out) return {};
  const parsed = JSON.parse(out);
  // a single field prints a scalar, both fields print an object
  return typeof parsed === 'object' ? { latest: parsed['dist-tags.latest'], deprecated: parsed.deprecated } : { latest: parsed };
}

switch (command) {
  case 'projects':
    console.log(entries.filter((e) => e.finalRelease).map((e) => e.project).join(','));
    break;

  case 'check':
    for (const entry of entries) {
      const { latest, deprecated, error } = view(entry.package);
      const state = error ? `error: ${error}` : `latest=${latest ?? '-'} deprecated=${deprecated ? 'yes' : 'no'}`;
      console.log(`${entry.package.padEnd(32)} ${state}`);
    }
    break;

  case 'deprecate': {
    let failed = 0;
    for (const entry of entries) {
      const message = deprecationMessage(entry);
      const { deprecated } = view(entry.package);
      if (deprecated === message) {
        console.log(`= ${entry.package} already deprecated`);
        continue;
      }
      if (DRY_RUN) {
        console.log(`[dry-run] npm deprecate ${entry.package} "${message}"`);
        continue;
      }
      try {
        execFileSync('npm', ['deprecate', entry.package, message], { stdio: 'inherit' });
        console.log(`✔ ${entry.package}`);
      } catch {
        failed++;
        console.error(`✗ ${entry.package}`);
      }
    }
    process.exit(failed > 0 ? 1 : 0);
  }

  default:
    console.error('Usage: deprecate-packages.mjs <projects|check|deprecate [--dry-run]>');
    process.exit(1);
}
