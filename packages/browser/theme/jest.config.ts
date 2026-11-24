module.exports = {
  coverageThreshold: { global: { lines: 70, statements: 70 } },
  displayName: 'browser-theme',
  preset: '../../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json', diagnostics: false }],
  },
  // anchored to the last node_modules segment so it also matches pnpm's node_modules/.pnpm/<pkg>/node_modules/<pkg>
  transformIgnorePatterns: ['/node_modules/(?!.*/node_modules/)(?!@material/material-color-utilities/)'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../../coverage/packages/browser/theme',
};
