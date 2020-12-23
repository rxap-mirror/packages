const nxPreset = require('@nrwl/jest/preset');
module.exports = {
  ...nxPreset,
  globals: {
    'ts-jest': {
      tsConfig: './tsconfig.spec.json',
      stringifyContentPathRegex: '\\.html$',
      astTransformers: [
        'jest-preset-angular/build/InlineFilesTransformer',
        'jest-preset-angular/build/StripStylesTransformer'
      ]
    }
  },
  setupFilesAfterEnv: ['jest-preset-angular', 'jest-extended'],
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  transform: {
    '^.+\\.(ts|html)$': 'ts-jest'
  },
  testPathIgnorePatterns: [
    'node_modules/',
    'dist/',
    'chromium-user-data/',
    'apps/(.*)-e2e/',
    '(.*).helper.spec.ts',
    'libs/rxap/'
  ],
  resolver: '@nrwl/jest/plugins/resolver',
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageReporters: ['json-summary', 'cobertura'],
  transformIgnorePatterns: ['node_modules/(?!@ngrx)'],
  collectCoverage: !!process.env.COLLECT_COVERAGE
};
