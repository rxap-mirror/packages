/* eslint-disable */
module.exports = {
  coverageThreshold: { global: { lines: 70, statements: 70 } },
  displayName: 'generator-utilities',
  preset: '../../../jest.preset.js',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/generator/utilities',
};
