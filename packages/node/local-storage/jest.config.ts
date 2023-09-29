/* eslint-disable */
export default {
  displayName: 'node-local-storage',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [ 'ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' } ],
  },
  moduleFileExtensions: [ 'ts', 'js', 'html' ],
  coverageDirectory: '../../../coverage/packages/node/local-storage',
};
