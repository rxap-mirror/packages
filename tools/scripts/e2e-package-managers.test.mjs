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
