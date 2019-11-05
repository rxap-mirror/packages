module.exports = {
  name: 'form-controls-demo',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/form-controls-demo',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
