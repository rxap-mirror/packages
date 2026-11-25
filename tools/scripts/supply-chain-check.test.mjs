// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { auditFindings, partitionAllowlist, resolveBase } from './supply-chain-check.mjs';

describe('supply-chain-check', () => {
  it('prefers the explicit base, then the upstream merge base, then origin/development', () => {
    assert.equal(resolveBase('abc', () => assert.fail('git must not run')), 'abc');
    assert.equal(resolveBase(undefined, (...a) => `mb:${ a[2] }`), 'mb:@{upstream}');
    const noUpstream = (...a) => {
      if (a[2] === '@{upstream}') {
        throw new Error('no upstream');
      }
      return `mb:${ a[2] }`;
    };
    assert.equal(resolveBase(undefined, noUpstream), 'mb:origin/development');
    assert.throws(() => resolveBase(undefined, () => {
      throw new Error('x');
    }), /base ref/);
  });

  it('splits the allowlist by expiry date and rejects incomplete entries', () => {
    const entries = [
      { id: 'GHSA-a', reason: 'r', expires: '2026-12-01' },
      { id: 'GHSA-b', reason: 'r', expires: '2026-11-24' },
    ];
    const { active, expired } = partitionAllowlist(entries, '2026-11-25');
    assert.deepEqual(active.map(e => e.id), [ 'GHSA-a' ]);
    assert.deepEqual(expired.map(e => e.id), [ 'GHSA-b' ]);
    assert.throws(() => partitionAllowlist([ { id: 'GHSA-c', expires: '2026-12-01' } ]), /invalid allowlist entry/);
  });

  it('reports only non-allowlisted high/critical advisories', () => {
    const report = {
      advisories: {
        1: { github_advisory_id: 'GHSA-high', severity: 'high', module_name: 'b', findings: [ { version: '1.0.0' }, { version: '1.0.0' } ], patched_versions: '>=1.0.1', title: 't' },
        2: { github_advisory_id: 'GHSA-low', severity: 'moderate', module_name: 'a', findings: [], title: 't' },
        3: { github_advisory_id: 'GHSA-ok', severity: 'critical', module_name: 'a', findings: [ { version: '2.0.0' } ], patched_versions: null, title: 't' },
      },
    };
    assert.deepEqual(auditFindings(report, [ { id: 'GHSA-ok' } ]).map(f => [ f.id, f.versions, f.patched ]), [ [ 'GHSA-high', '1.0.0', '>=1.0.1' ] ]);
    assert.deepEqual(auditFindings(report).map(f => f.id), [ 'GHSA-ok', 'GHSA-high' ]);
  });
});
