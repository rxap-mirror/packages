/* eslint-disable */
module.exports = {
  coverageThreshold: { global: { lines: 90, statements: 90 } },
  displayName: 'n8n-nodes-yaml',
  preset: '../../../../jest.preset.js',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/packages/n8n/nodes/yaml',
};
