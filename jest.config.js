const tsconfig = require('./tsconfig.json');
const paths = tsconfig.compilerOptions.paths;
const moduleNameMapper = {};
for (const module of Object.keys(paths)) {
  moduleNameMapper[module] = '<rootDir>/' + paths[module][0];
}

module.exports = {
  globals: {
    'ts-jest': {
      tsConfigFile: './tsconfig.wallaby.json',
      stringifyContentPathRegex: '\\.html$',
      astTransformers: [
        '<rootDir>/node_modules/jest-preset-angular/InlineHtmlStripStylesTransformer'
      ]
    },
    __TRANSFORM_HTML__: true
  },
  testMatch: ['**/+(*.)+(spec).+(ts)?(x)'],
  setupFilesAfterEnv: [
    '<rootDir>/node_modules/@angular-builders/jest/dist/jest-config/setup.js'
  ],
  transform: {
    '^.+\\.(ts|html)$': 'ts-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!@ngrx)'],
  resolver: '@nrwl/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js'],
  collectCoverage: !!process.env.COLLECT_COVERAGE,
  coverageReporters: ['html', 'json-summary'],
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/dist/',
    '<rootDir>/chromium-user-data/',
    '<rootDir>/apps/(.*)-e2e/'
  ],
  moduleNameMapper
};
