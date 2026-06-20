/* eslint-disable */
module.exports = {
  displayName: 'schematic-angular',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  // @rxap/* → source resolution is handled globally by jest.preset.js
  // (pathsToModuleNameMapper over tsconfig.base paths).
  coverageDirectory: '../../../coverage/packages/schematic/angular',
};
