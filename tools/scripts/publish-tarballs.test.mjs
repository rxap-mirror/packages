// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { blockedByMembers, plan, publishAll, publishArgs } from './publish-tarballs.mjs';

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

  it('publishes the members in parallel and the umbrella last', async () => {
    let running = 0;
    let peak = 0;
    const order = [];
    const members = Array.from({ length: 10 }, (_, i) => ({ group: 'packages', name: `@rxap/m${ i }`, version: '1.0.0', action: 'publish' }));
    const steps = [ { group: 'rxap', name: 'rxap', version: '1.0.0', action: 'publish' }, ...members ];
    const failed = await publishAll(steps, async (step) => {
      running++;
      peak = Math.max(peak, running);
      await new Promise((r) => setTimeout(r, 5));
      running--;
      order.push(step.name);
      return true;
    }, 4);
    assert.deepEqual(failed, []);
    assert.equal(peak, 4);
    assert.equal(order.at(-1), 'rxap');
  });

  it('holds the umbrella back and reports every failed member', async () => {
    const steps = plan(manifest, () => false);
    const published = [];
    const failed = await publishAll(steps, async (step) => {
      published.push(step.name);
      return step.name !== '@rxap/b';
    }, 2);
    assert.deepEqual(failed.map((f) => f.name).sort(), [ '@rxap/b', 'rxap' ]);
    assert.ok(!published.includes('rxap'));
  });

  it('imports node built-ins only (it runs without a checkout)', () => {
    const src = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'publish-tarballs.mjs'), 'utf-8');
    const imports = [ ...src.matchAll(/^import .* from '([^']+)';$/gm) ].map(m => m[1]);
    assert.ok(imports.length > 0);
    assert.deepEqual(imports.filter(i => !i.startsWith('node:')), []);
  });
});
