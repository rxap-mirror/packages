// Run with: pnpm test:scripts
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { parsePackageKey, pnpmResolutions, requestedRanges, yarnResolutions } from './audit-lockfile-cooldown.mjs';

const PNPM_LOCK = `---
lockfileVersion: '9.0'

importers:

  .:
    packageManagerDependencies:
      pnpm:
        specifier: 12.21.0
        version: 12.21.0

packages:

  pnpm@12.21.0:
    resolution: {integrity: sha512-x}

---
lockfileVersion: '9.0'

importers:

  .:
    dependencies:
      left-pad:
        specifier: ^1.1.0
        version: 1.3.0
  packages/a:
    dependencies:
      '@scope/lib':
        specifier: ~2.0.0
        version: 2.0.1(left-pad@1.3.0)

packages:

  '@scope/lib@2.0.1':
    resolution: {integrity: sha512-a}

  left-pad@1.3.0:
    resolution: {integrity: sha512-b}

  local-thing@file:packages/local:
    resolution: {directory: packages/local, type: directory}

snapshots:

  '@scope/lib@2.0.1(left-pad@1.3.0)':
    dependencies:
      left-pad: 1.3.0

  left-pad@1.3.0: {}
`;

describe('audit-lockfile-cooldown', () => {
  it('parses scoped, peer-suffixed and non-registry package keys', () => {
    assert.deepEqual(parsePackageKey('@scope/lib@2.0.1(left-pad@1.3.0)'), { name: '@scope/lib', version: '2.0.1' });
    assert.deepEqual(parsePackageKey('left-pad@1.3.0'), { name: 'left-pad', version: '1.3.0' });
    assert.equal(parsePackageKey('local-thing@file:packages/local'), null);
  });

  it('reads the registry packages of the lockfile document, not of the package-manager document', () => {
    assert.deepEqual([ ...pnpmResolutions(PNPM_LOCK).keys() ].sort(), [ '@scope/lib@2.0.1', 'left-pad@1.3.0' ]);
  });

  it('still reads a yarn berry lockfile (base refs from before the pnpm migration)', () => {
    const yarnLock = '"left-pad@npm:^1.1.0":\n  version: 1.3.0\n  resolution: "left-pad@npm:1.3.0"\n';
    assert.deepEqual([ ...yarnResolutions(yarnLock).keys() ], [ 'left-pad@1.3.0' ]);
  });

  it('collects the ranges of the importers and of the dependents', async () => {
    const { pnpmLockDocument } = await import('./audit-lockfile-cooldown.mjs');
    const lock = pnpmLockDocument(PNPM_LOCK);
    const manifests = { '@scope/lib@2.0.1': { dependencies: { 'left-pad': '^1.2.0' } } };
    const ranges = await requestedRanges(lock, { name: 'left-pad', version: '1.3.0' }, async (n, v) => manifests[`${ n }@${ v }`]);
    assert.deepEqual(ranges.sort(), [ '^1.1.0', '^1.2.0' ]);
  });
});
