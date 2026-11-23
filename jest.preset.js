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
  // coverage is always collected (also for files no spec imports) so the per-project coverageThreshold is enforced
  collectCoverage: true,
  coverageReporters: [ 'json-summary', 'text-summary' ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.stories.ts',
    '!src/test-setup.ts',
  ],
  // ESM-only dependencies (magic-string >= 1 and its @jridgewell deps from @angular-devkit/schematics 22, @nestjs/* 12)
  // have to be transformed to CommonJS for the jest runtime. The project `transform` entries must not match node_modules.
  transformIgnorePatterns: [ 'node_modules/(?!(?:magic-string|@jridgewell/[^/]+|@nestjs/[^/]+|reflect-metadata)/)' ],
  transform: {
    // has to be the first entry: the first matching pattern wins
    '^.+/node_modules/(?:magic-string|@jridgewell/[^/]+|@nestjs/[^/]+|reflect-metadata)/.+\\.m?js$': join(__dirname, 'tools/jest/esm-to-cjs-transformer.js'),
    ...(nxPreset.transform ?? {}),
  },
  // Resolve every workspace @rxap/* import to source via the tsconfig paths.
  // node_modules links some workspace packages as symlinks and installs others
  // from the registry (and yarn reinstalls flip this), so relying on node
  // resolution makes specs import stale published dists. Mapping to source makes
  // test resolution deterministic regardless of the install layout.
  moduleNameMapper: {
    ...pathsToModuleNameMapper(
      // `@nx/*` entries only exist so TypeScript (moduleResolution node10) can find the exports-only @nx packages
      Object.fromEntries(Object.entries(compilerOptions.paths ?? {}).filter(([ key ]) => !key.startsWith('@nx/'))),
      {
      prefix: `${ __dirname }/`,
    }),
    // @angular-devkit/schematics 21 bundles ESM-only ora v8 which jest (CJS)
    // cannot parse from node_modules; stub it (it is never used in unit tests).
    '^ora$': join(__dirname, 'tools/jest/ora-stub.js'),
    // prettier >= 3.7 crashes the CommonJS jest runtime on load (dynamic ESM import); see the stub.
    '^prettier$': join(__dirname, 'tools/jest/prettier-stub.js'),
    // @ng-prism/core is ESM-only; components only import the @Showcase decorator, a runtime no-op.
    '^@ng-prism/core$': join(__dirname, 'tools/jest/ng-prism-stub.js'),
  },
};
