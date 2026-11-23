/* eslint-disable */
module.exports = {
  coverageThreshold: { global: { lines: 90, statements: 90 } },
  displayName: 'n8n-nodes-zip',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/packages/n8n/nodes/zip',
};
