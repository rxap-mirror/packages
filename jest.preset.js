const { join } = require('path');
const nxPreset = require('@nx/jest/preset').default;
const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.base.json');

const ESM_ONLY_PACKAGES = [
  'magic-string',
  '@jridgewell/[^/]+',
  '@nestjs/[^/]+',
  'reflect-metadata',
  '@faker-js/faker',
  'htmlparser2',
  'domhandler',
  'domutils',
  'dom-serializer',
  'domelementtype',
  'entities',
  // amqplib >= 2 / amqp-connection-manager >= 5
  'promise-breaker',
  // jwks-rsa >= 4 (firebase-admin >= 13)
  'jose',
].join('|');

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
  // every jest task would otherwise start (cores - 1) workers, multiplied by the Nx task parallelism
  maxWorkers: process.env.JEST_MAX_WORKERS ?? 2,
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
  // ESM-only dependencies (magic-string >= 1 and its @jridgewell deps from @angular-devkit/schematics 22, @nestjs/* 12,
  // @faker-js/faker >= 10, htmlparser2 >= 10 with the dom* family) have to be transformed to CommonJS for the jest runtime.
  // The ignore pattern is anchored to the LAST node_modules segment so nested installs
  // (node_modules/@angular-devkit/schematics/node_modules/magic-string) are transformed as well.
  // The project `transform` entries must not match node_modules.
  transformIgnorePatterns: [ `/node_modules/(?!.*/node_modules/)(?!(?:${ ESM_ONLY_PACKAGES })/)` ],
  transform: {
    // has to be the first entry: the first matching pattern wins
    [`^.+/node_modules/(?:${ ESM_ONLY_PACKAGES })/.+\\.m?js$`]: join(__dirname, 'tools/jest/esm-to-cjs-transformer.js'),
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
      // (`auth0/legacy` is the same kind of entry: types for an exports-only subpath, resolved by node at runtime)
      Object.fromEntries(Object.entries(compilerOptions.paths ?? {}).filter(([ key ]) => !key.startsWith('@nx/') && key !== 'auth0/legacy')),
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
