/* eslint-disable */
module.exports = {
  displayName: 'nest-socket-io-client',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/nest/socket-io-client',
};
