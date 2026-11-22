/* eslint-disable */
module.exports = {
  displayName: 'schematic-nestjs',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '\\.(cy|stories)\\.ts$'],
  coverageDirectory: '../../../coverage/packages/schematic/nestjs',
};
