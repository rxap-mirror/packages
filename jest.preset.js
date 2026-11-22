const { join } = require('path');
const nxPreset = require('@nx/jest/preset').default;
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');

module.exports = {
  ...nxPreset,
  // Polyfill performance.mark/measure for Nx 21's project-graph plugin loader,
  // which jest's sandboxed node environment does not fully provide.
  setupFiles: [ ...(nxPreset.setupFiles ?? []), join(__dirname, 'tools/jest/polyfills.js') ],
  // Nx 21 generators (especially @nx/nest / @nx/angular) are slower to run
  // inside a jest worker than the default 5s hook/test timeout allows, which
  // made generator beforeEach() hooks time out. Raise the default for the whole
  // workspace.
  testTimeout: 30000,
  // Resolve every workspace @rxap/* import to source via the tsconfig paths.
  // node_modules links some workspace packages as symlinks and installs others
  // from the registry (and yarn reinstalls flip this), so relying on node
  // resolution makes specs import stale published dists. Mapping to source makes
  // test resolution deterministic regardless of the install layout.
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions.paths ?? {}, {
      prefix: `${ __dirname }/`,
    }),
    // @angular-devkit/schematics 21 bundles ESM-only ora v8 which jest (CJS)
    // cannot parse from node_modules; stub it (it is never used in unit tests).
    '^ora$': join(__dirname, 'tools/jest/ora-stub.js'),
    // @ng-prism/core is ESM-only; components only import the @Showcase decorator, a runtime no-op.
    '^@ng-prism/core$': join(__dirname, 'tools/jest/ng-prism-stub.js'),
  },
};
