/* eslint-disable */
module.exports = {
  displayName: 'plugin-cypress',
  preset: '../../../jest.preset.js',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/plugin/cypress',
};
