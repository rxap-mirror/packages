module.exports = {
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/libs/layout',

  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {},
  displayName: 'layout',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
  transform: {
    '^.+\\.(ts|js|html)$': [
      'jest-preset-angular',
      {
        stringifyContentPathRegex: '\\.(html|svg)$',

        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
};
