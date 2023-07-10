/* eslint-disable */
export default {
  displayName: 'reflect-metadata',
  preset: '../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': [ 'ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' } ],
  },
  moduleFileExtensions: [ 'ts', 'js', 'html' ],
  coverageDirectory: '../../coverage/packages/reflect-metadata',
};
