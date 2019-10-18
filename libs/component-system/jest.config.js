module.exports = {
  name: 'component-system',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/component-system',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
