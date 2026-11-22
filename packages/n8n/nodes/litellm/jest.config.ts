module.exports = {
  displayName: 'n8n-nodes-litellm',
  preset: '../../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  // the workspace hoists zod@3.24 which has no `zod/v3` subpath required by @langchain/core
  moduleNameMapper: {
    '^zod/v3$': require.resolve('zod'),
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../../coverage/packages/n8n/nodes/litellm',
};
