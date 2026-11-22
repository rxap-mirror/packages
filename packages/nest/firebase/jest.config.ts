/* eslint-disable */
module.exports = {
  displayName: 'nest-firebase',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/nest/firebase',
};
