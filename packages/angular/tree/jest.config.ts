/* eslint-disable */
module.exports = {
  coverageThreshold: { global: { lines: 70, statements: 70 } },
  displayName: 'angular-tree',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../../coverage/packages/angular/tree',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  // @faker-js/faker >= 10 is ESM-only (.js): it has to be transformed together with the .mjs files
  // anchored to the last node_modules segment so it also matches pnpm's node_modules/.pnpm/<pkg>/node_modules/<pkg>
  transformIgnorePatterns: ['/node_modules/(?!.*/node_modules/)(?!.*\\.mjs$|@faker-js/faker/)'],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
