/* eslint-disable */
// Node/CommonJS specs (generators). The Angular library specs run with Vitest (target `test`).
module.exports = {
  displayName: 'angular-table-system-generators',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/src/generators/**/*.spec.ts'],
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': [
      'ts-jest',
      { tsconfig: '<rootDir>/tsconfig.generators.spec.json' },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory:
    '../../../coverage/packages/angular/table-system/generators',
};
