module.exports = {
  name: 'form-system',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/form-system',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
