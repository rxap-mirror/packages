/* eslint-disable */
module.exports = {
  displayName: 'plugin-application',
  preset: '../../../jest.preset.js',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/plugin/application',
};
