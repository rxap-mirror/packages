/* eslint-disable */
module.exports = {
  coverageThreshold: { global: { lines: 70, statements: 70 } },
  displayName: 'schematic-open-api',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/schematic/open-api',
};
