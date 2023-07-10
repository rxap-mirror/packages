/* eslint-disable */
export default {
  displayName: 'data-structure-tree',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': [ 'ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' } ],
  },
  moduleFileExtensions: [ 'ts', 'js', 'html' ],
  coverageDirectory: '../../../coverage/packages/data-structure/tree',
};
