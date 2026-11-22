module.exports = {
  displayName: 'browser-localize',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', diagnostics: false }],
  },
  // the esm build of xliff is not loadable by jest (cjs); use the cjs build
  moduleNameMapper: { '^xliff/esm$': '<rootDir>/../../../node_modules/xliff/cjs/index.js' },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/browser/localize',
};
