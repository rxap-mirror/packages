module.exports = {
  name: 'loader',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/loader',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
