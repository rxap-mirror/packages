module.exports = {
  displayName: 'service-nest',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'junit/demos/nest',
        suiteName: 'service-nest',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
      },
    ],
  ],
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: {
    '^(?!.*/node_modules/).+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/demos/nest',
};
