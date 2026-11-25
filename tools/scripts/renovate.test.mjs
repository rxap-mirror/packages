// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { postUpgrade, resolveBase } from './renovate-post-upgrade.mjs';
import { buildTiers, classified, rootDependencies, serialize, tierDays, weeklyForDays } from './renovate-tiers.mjs';

describe('renovate-tiers', () => {
  it('maps weekly downloads to the cooldown tiers, unknown to the strictest', () => {
    assert.equal(tierDays(5_000_000), 7);
    assert.equal(tierDays(1_000_000), 7);
    assert.equal(tierDays(999_999), 14);
    assert.equal(tierDays(100_000), 14);
    assert.equal(tierDays(99_999), 30);
    assert.equal(tierDays(null), 30);
  });

  it('lists the root dependencies without workspace packages', () => {
    const pkg = { dependencies: { b: '1', '@rxap/x': '1' }, devDependencies: { a: '1', b: '1' } };
    assert.deepEqual(rootDependencies(pkg), [ 'a', 'b' ]);
  });

  it('writes sorted, deterministic package rules per tier', () => {
    const tiers = buildTiers({ zod: 9_000_000, rxjs: 2_000_000, mid: 200_000, niche: 10, unknown: null });
    assert.deepEqual(tiers.packageRules.map(r => [ r.minimumReleaseAge, r.matchPackageNames ]), [
      [ '7 days', [ 'rxjs', 'zod' ] ],
      [ '14 days', [ 'mid' ] ],
      [ '30 days', [ 'niche', 'unknown' ] ],
    ]);
    assert.deepEqual(buildTiers({ niche: 1 }).packageRules.map(r => r.minimumReleaseAge), [ '30 days' ]);
    assert.equal(serialize(tiers), serialize(buildTiers({ unknown: null, niche: 10, mid: 200_000, rxjs: 2_000_000, zod: 9_000_000 })));
  });

  it('reuses an existing classification', () => {
    const known = classified(buildTiers({ a: 2_000_000, b: 200_000, c: 1 }));
    assert.deepEqual(known, { a: 7, b: 14, c: 30 });
    assert.deepEqual(Object.fromEntries(Object.entries(known).map(([ n, d ]) => [ n, tierDays(weeklyForDays(d)) ])), known);
  });
});

describe('renovate-post-upgrade', () => {
  it('finds the merge base with the base branch, or none', () => {
    assert.equal(resolveBase((...a) => `mb:${ a[2] }`, 'development'), 'mb:origin/development');
    assert.equal(resolveBase(() => {
      throw new Error('no ref');
    }, 'development'), null);
  });

  it('aligns, regenerates the tiers, pins young transitives and re-resolves', () => {
    const calls = [];
    const run = (cmd, args) => {
      calls.push([ cmd, ...args ].join(' '));
      return !args.includes('--write-resolutions');
    };
    postUpgrade({ run, base: 'abc' });
    assert.deepEqual(calls, [
      'node tools/scripts/align-framework-dep-versions.mjs',
      'node tools/scripts/renovate-tiers.mjs --missing-only',
      'pnpm install --lockfile-only --ignore-scripts',
      'node tools/scripts/audit-lockfile-cooldown.mjs abc --write-resolutions',
      'pnpm install --lockfile-only --ignore-scripts',
    ]);
  });

  it('skips the transitive pins without a base and does not re-resolve a clean lockfile', () => {
    const calls = [];
    postUpgrade({ run: (_cmd, args) => calls.push(args[0]) && true, base: null });
    assert.equal(calls.length, 3);
    const clean = [];
    postUpgrade({ run: (_cmd, args) => clean.push(args[0]) && true, base: 'abc' });
    assert.equal(clean.length, 4);
  });
});
