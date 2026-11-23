/* eslint-disable */
// Node/CommonJS specs (generators). The Angular library specs run with Vitest (target `test`).
module.exports = {
  displayName: 'angular-user-generators',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  collectCoverage: false,
  testMatch: ['<rootDir>/src/generators/**/*.spec.ts'],
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.generators.spec.json' },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/angular/user/generators',
};
