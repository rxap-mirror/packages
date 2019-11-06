module.exports = {
  name: 'config',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/config',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
