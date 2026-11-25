// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { blockedByMembers, plan, publishArgs } from './publish-tarballs.mjs';

const manifest = {
  distTag: 'development',
  registry: 'https://registry.npmjs.org',
  packages: [
    { group: 'packages', name: '@rxap/a', version: '1.0.1-dev.0', file: 'rxap-a-1.0.1-dev.0.tgz' },
    { group: 'packages', name: '@rxap/b', version: '2.0.0-dev.3', file: 'rxap-b-2.0.0-dev.3.tgz' },
    { group: 'rxap', name: 'rxap', version: '22.0.1-dev.0', file: 'rxap-22.0.1-dev.0.tgz' },
  ],
};

describe('publish-tarballs', () => {
  it('skips versions that are already on the registry (job retry)', () => {
    const steps = plan(manifest, (name, version) => name === '@rxap/a' && version === '1.0.1-dev.0');
    assert.deepEqual(steps.map(s => s.action), [ 'skip', 'publish', 'publish' ]);
  });

  it('holds the umbrella back when a member failed', () => {
    const [ a, , umbrella ] = manifest.packages;
    assert.ok(blockedByMembers(umbrella, [ a ]));
    assert.ok(!blockedByMembers(umbrella, []));
    assert.ok(!blockedByMembers(a, [ umbrella ]));
  });

  it('publishes the tarball with the dist-tag of the release branch', () => {
    assert.deepEqual(publishArgs('/x/a.tgz', manifest),
      [ 'publish', '/x/a.tgz', '--tag', 'development', '--access', 'public', '--registry', 'https://registry.npmjs.org' ]);
  });

  it('imports node built-ins only (it runs without a checkout)', () => {
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'publish-tarballs.mjs'), 'utf-8');
    const imports = [ ...src.matchAll(/^import .* from '([^']+)';$/gm) ].map(m => m[1]);
    assert.ok(imports.length > 0);
    assert.deepEqual(imports.filter(i => !i.startsWith('node:')), []);
  });
});
