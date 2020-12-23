module.exports = {
  preset: '../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  coverageDirectory: '../../coverage/libs/json-schema-to-typescript',
  displayName: 'json-schema-to-typescript'
};
