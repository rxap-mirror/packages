module.exports = {
  name: 'form-system-dev',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/form-system-dev',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
