module.exports = {
  preset: '../../jest.preset.js',
  coverageDirectory: '../../coverage/libs/open-api',

  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.(html|svg)$',

      tsconfig: "<rootDir>/tsconfig.spec.json"
    },
  },
  displayName: "open-api",
  snapshotSerializers: [
    "jest-preset-angular/build/serializers/no-ng-attributes",
    "jest-preset-angular/build/serializers/ng-snapshot",
    "jest-preset-angular/build/serializers/html-comment"
  ],
  transform: { "^.+\\.(ts|js|html)$": "jest-preset-angular" }
};
