/* eslint-disable */
module.exports = {
  coverageThreshold: { global: { lines: 70, statements: 70 } },
  displayName: 'plugin-angular',
  preset: '../../../jest.preset.js',
  // Generator tests run @nx/angular generators which (under Nx 21) build the
  // project graph and need node APIs (performance.mark, setTimeout().unref).
  // The @nx/jest preset defaults to jsdom, which lacks them.
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/plugin/angular',
};
