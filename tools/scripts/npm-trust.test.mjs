// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { fromName, matchesTrust, packageNames, trustArgs } from './npm-trust.mjs';

describe('npm-trust', () => {
  it('lists every published package by its npm name', () => {
    const names = packageNames();
    assert.ok(names.length > 100);
    assert.ok(names.includes('rxap') && names.includes('@rxap/forms'), 'npm names, not project names (angular-forms)');
    assert.equal(new Set(names).size, names.length);
  });

  it('configures GitLab trusted publishing with direct publish allowed', () => {
    assert.deepEqual(trustArgs('@rxap/forms'), [
      'trust', 'gitlab', '@rxap/forms', '--project', 'rxap/packages', '--file', '.gitlab-ci.yml', '--env', 'npm', '--allow-publish', '--yes',
    ]);
  });

  it('resumes from a package and recognises the configuration', () => {
    assert.deepEqual(fromName([ 'a', 'b', 'c' ], 'b'), [ 'b', 'c' ]);
    assert.throws(() => fromName([ 'a' ], 'x'));
    assert.ok(matchesTrust([ { type: 'gitlab', claims: { project: 'rxap/packages', file: '.gitlab-ci.yml' } } ]));
    assert.ok(!matchesTrust([]));
  });
});
