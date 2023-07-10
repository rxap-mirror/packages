/* eslint-disable */
export default {
  displayName: 'schematic-ts-morph',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': [ 'ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' } ],
  },
  moduleFileExtensions: [ 'ts', 'js', 'html' ],
  coverageDirectory: '../../../coverage/packages/schematic/ts-morph',
};
