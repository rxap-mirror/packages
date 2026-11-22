/* eslint-disable */
module.exports = {
  displayName: 'n8n-nodes-yaml',
  preset: '../../../../jest.preset.js',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/packages/n8n/nodes/yaml',
};
