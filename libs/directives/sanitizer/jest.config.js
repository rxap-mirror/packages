module.exports = {
  name: 'directives-sanitizer',
  preset: '../../../jest.config.js',
  coverageDirectory: '../../../coverage/libs/directives/sanitizer',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
