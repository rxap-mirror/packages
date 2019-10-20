module.exports = {
  name: 'window-system',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/window-system',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
