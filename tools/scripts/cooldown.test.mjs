// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createResolver, DAY, eligibleVersions, isEligible, pinnedVersions, tierDays } from './lib/cooldown.mjs';

const NOW = Date.parse('2026-11-25T00:00:00Z');
const ago = days => new Date(NOW - days * DAY).toISOString();

/** registry doc: versions as { version: { age, deprecated?, peers? } } */
function doc(versions, latest) {
  return {
    'dist-tags': { latest: latest ?? Object.keys(versions).at(-1) },
    versions: Object.fromEntries(Object.entries(versions).map(([ v, m ]) => [ v, { deprecated: m.deprecated, peerDependencies: m.peers } ])),
    time: Object.fromEntries(Object.entries(versions).map(([ v, m ]) => [ v, ago(m.age) ])),
  };
}

describe('cooldown rules', () => {
  it('maps downloads to tiers, unknown to the strictest, and honours a minimum', () => {
    assert.equal(tierDays(2_000_000), 7);
    assert.equal(tierDays(150_000), 14);
    assert.equal(tierDays(10), 30);
    assert.equal(tierDays(null), 30);
    assert.equal(tierDays(2_000_000, 10), 10);
  });

  it('keeps only stable, old enough, non-deprecated versions up to latest', () => {
    const d = doc({
      '1.0.0': { age: 60 },
      '1.1.0': { age: 20, deprecated: 'bad' },
      '1.2.0': { age: 15 },
      '1.3.0-rc.0': { age: 30 },
      '1.3.0': { age: 3 },
      '2.0.0': { age: 40 },
    }, '1.3.0');
    assert.deepEqual(eligibleVersions(d, { cooldownDays: 14, now: NOW }), [ '1.2.0', '1.0.0' ]);
    assert.deepEqual(eligibleVersions(d, { cooldownDays: 14, hold: '<1.2.0', now: NOW }), [ '1.0.0' ]);
    assert.equal(isEligible(d, '1.2.0', 14, NOW), true);
    assert.equal(isEligible(d, '1.3.0', 7, NOW), false);
    assert.equal(isEligible(d, '1.1.0', 7, NOW), false);
    assert.equal(isEligible(d, '9.9.9', 7, NOW), false);
  });

  it('reads the pinned versions of package.json ranges', () => {
    assert.deepEqual(pinnedVersions({ dependencies: { a: '^1.2.3', b: 'workspace:*' }, devDependencies: { c: '2.0.0' } }), { a: '1.2.3', c: '2.0.0' });
  });
});

describe('createResolver', () => {
  const docs = {
    lib: doc({ '1.0.0': { age: 90 }, '1.5.0': { age: 40 }, '2.0.0': { age: 35, peers: { host: '^2.0.0' } }, '2.1.0': { age: 2 } }),
    host: doc({ '1.0.0': { age: 90 } }),
    plugin: doc({ '1.0.0': { age: 90, peers: { lib: '^1.0.0' } } }),
  };
  const make = (workspaceVersions, extra = {}) => createResolver({
    workspaceVersions,
    getDoc: name => docs[name] ?? null,
    weeklyDownloads: async () => 50_000, // 30-day tier
    now: () => NOW,
    ...extra,
  });

  it('picks the newest eligible version whose peers fit, never the too-young one', async () => {
    const r = make({ lib: '1.0.0', host: '1.0.0' });
    const res = await r.resolveOne('lib', '1.0.0', 'dependencies');
    assert.equal(res.target, '1.5.0');
    assert.equal(res.status, 'minor');
    assert.match(res.rejected[0], /^2\.0\.0: host@1\.0\.0/);
  });

  it('respects reverse peers of installed packages after preload', async () => {
    const r = make({ lib: '1.0.0', host: '2.5.0', plugin: '1.0.0' });
    await r.preload([ 'plugin' ]);
    assert.equal((await r.resolveOne('lib', '1.0.0', 'dependencies', { host: '2.5.0' })).target, '1.5.0');
    const free = make({ lib: '1.0.0', host: '2.5.0', plugin: '1.0.0' }, { ignorePeersOf: new Set([ 'plugin' ]) });
    await free.preload([ 'plugin' ]);
    assert.equal((await free.resolveOne('lib', '1.0.0', 'dependencies', { host: '2.5.0' })).target, '2.0.0');
  });

  it('skips non-registry ranges and unknown packages', async () => {
    const r = make({});
    assert.equal((await r.resolveOne('x', 'workspace:*', 'dependencies')).status, 'skipped');
    assert.equal((await r.resolveOne('nope', '1.0.0', 'dependencies')).reason, 'not on registry');
  });
});
