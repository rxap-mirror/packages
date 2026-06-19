/* eslint-disable */
export default {
  displayName: 'schematic-angular',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: [ '<rootDir>/src/test-setup.ts' ],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [ 'ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' } ],
  },
  moduleFileExtensions: [ 'ts', 'js', 'html' ],
  // Resolve the workspace test harness from source. node_modules has a stale
  // published @rxap/schematics-utilities (it is not symlinked to the workspace),
  // so without this map the specs would import the registry dist and miss
  // source-only test helpers (captureTree / diffTreeContent).
  moduleNameMapper: {
    '^@rxap/schematics-utilities$': '<rootDir>/../utilities/src/index.ts',
  },
  coverageDirectory: '../../../coverage/packages/schematic/angular',
};
