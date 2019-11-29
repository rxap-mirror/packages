module.exports = {
  name: 'table-system-playground',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/table-system-playground',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
