/* eslint-disable */
export default {
  displayName: 'plugin-nestjs',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  setupFilesAfterEnv: [ '<rootDir>/src/test-setup.ts' ],
  transform: {
    '^.+\\.[tj]s$': [ 'ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' } ],
  },
  moduleFileExtensions: [ 'ts', 'js', 'html' ],
  coverageDirectory: '../../../coverage/packages/plugin/nestjs',
};
