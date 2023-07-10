/* eslint-disable */
export default {
  displayName: 'angular-form-window-system',
  preset: '../../../jest.preset.js',
  setupFilesAfterEnv: [ '<rootDir>/src/test-setup.ts' ],
  coverageDirectory: '../../../coverage/packages/angular/form-window-system',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  transformIgnorePatterns: [ 'node_modules/(?!.*\\.mjs$)' ],
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
