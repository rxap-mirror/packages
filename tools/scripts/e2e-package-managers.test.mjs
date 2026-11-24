// Run with: yarn test:scripts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { yarnHits } from './e2e-package-managers.mjs';

describe('e2e-package-managers yarnHits', () => {
  const diff = [
    'diff --git a/package.json b/package.json',
    '--- a/package.json',
    '+++ b/package.json',
    '@@ -3,0 +4,2 @@',
    '+    "build": "yarn nx run-many -t build",',
    '+    "test": "nx test",',
    'diff --git a/yarn.lock b/yarn.lock',
    '--- /dev/null',
    '+++ b/yarn.lock',
    '@@ -0,0 +1 @@',
    '+# yarn lockfile v1',
    'diff --git a/.gitlab-ci.yml b/.gitlab-ci.yml',
    '--- a/.gitlab-ci.yml',
    '+++ b/.gitlab-ci.yml',
    '@@ -10 +10,2 @@',
    '-  script: npm ci',
    '+  script: Yarn install',
    '+  # mentions yarnpkg but not the word',
  ].join('\n');

  it('reports added lines that mention yarn with file and line, ignoring lockfiles and removed lines', () => {
    assert.deepEqual(yarnHits(diff), [
      'package.json:4: "build": "yarn nx run-many -t build",',
      '.gitlab-ci.yml:10: script: Yarn install',
    ]);
  });
});

describe('e2e-package-managers versions', async () => {
  const { e2eVersion, rewriteManifest } = await import('./e2e-package-managers.mjs');

  it('appends the run id so the version is unique and still matches the original ^range', () => {
    assert.equal(e2eVersion('24.0.0-dev.1', '20261124153000'), '24.0.0-dev.1.e2e.20261124153000');
    assert.equal(e2eVersion('1.2.3', '20261124153000'), '1.2.3-e2e.20261124153000');
  });

  it('rewrites the own version, internal dependency ranges and the package group, nothing else', () => {
    const versions = new Map([
      ['@rxap/a', '1.0.0-dev.1.e2e.1'],
      ['@rxap/b', '2.0.0-e2e.1'],
    ]);
    const manifest = {
      name: '@rxap/a',
      version: '1.0.0-dev.1',
      dependencies: { '@rxap/b': '^2.0.0', tslib: '2.9.1' },
      peerDependencies: { '@rxap/b': '^2.0.0', '@angular/core': '^22.0.0' },
      'nx-migrations': { packageGroup: [{ package: '@rxap/b', version: '2.0.0' }, { package: '@angular/core', version: '22.3.0' }] },
    };
    const result = rewriteManifest(manifest, versions);
    assert.equal(result.version, '1.0.0-dev.1.e2e.1');
    assert.deepEqual(result.dependencies, { '@rxap/b': '2.0.0-e2e.1', tslib: '2.9.1' });
    assert.deepEqual(result.peerDependencies, { '@rxap/b': '2.0.0-e2e.1', '@angular/core': '^22.0.0' });
    assert.deepEqual(result['nx-migrations'].packageGroup, [{ package: '@rxap/b', version: '2.0.0-e2e.1' }, { package: '@angular/core', version: '22.3.0' }]);
    assert.equal(manifest.version, '1.0.0-dev.1', 'the input manifest is not mutated');
  });
});
