/* eslint-disable */
export default {
  displayName: 'schematic-xml-parser',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]s$': [ 'ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' } ],
  },
  moduleFileExtensions: [ 'ts', 'js', 'html' ],
  coverageDirectory: '../../../coverage/packages/schematic/xml-parser',
};
