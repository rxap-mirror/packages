module.exports = {
  name: 'table-system',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/table-system',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
