module.exports = {
  name: 'data-source',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/data-source',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
