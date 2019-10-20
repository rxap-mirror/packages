module.exports = {
  name: 'window-system-demo',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/window-system-demo',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
