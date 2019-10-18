module.exports = {
  name: 'form-system-demo',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/form-system-demo',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
