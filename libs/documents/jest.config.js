module.exports = {
  name: 'documents',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/documents',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
