module.exports = {
  name: 'xml-parser',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/xml-parser',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ]
};
