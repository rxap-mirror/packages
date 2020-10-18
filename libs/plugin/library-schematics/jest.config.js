module.exports = {
  name: 'plugin-library-schematics',
  preset: '../../../jest.config.js',
  transform: {
    '^.+\\.[tj]sx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'html'],
  coverageDirectory: '../../../coverage/libs/plugin/library-schematics',
  globals: { 'ts-jest': { tsConfig: '<rootDir>/tsconfig.spec.json' } }
};
