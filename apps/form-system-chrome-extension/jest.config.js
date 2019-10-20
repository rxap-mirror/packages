module.exports = {
  name: 'form-system-chrome-extension',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/apps/form-system-chrome-extension',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
