/* eslint-disable */
module.exports = {
  coverageThreshold: { global: { lines: 90, statements: 90 } },
  displayName: 'nest-oauth2-proxy',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/nest/oauth2-proxy',
};
