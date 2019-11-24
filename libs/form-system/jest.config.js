const tsconfig = require('./tsconfig.json');
const paths = tsconfig.compilerOptions.paths;
const moduleNameMapper = {};
for (const module of Object.keys(paths)) {
  moduleNameMapper[module] = '<rootDir>/../../' + paths[module][0];
}

module.exports = {
  name: 'form-system',
  preset: '../../jest.config.js',
  coverageDirectory: '../../coverage/libs/form-system',
  snapshotSerializers: [
    'jest-preset-angular/AngularSnapshotSerializer.js',
    'jest-preset-angular/HTMLCommentSerializer.js'
  ],
  moduleNameMapper
};
