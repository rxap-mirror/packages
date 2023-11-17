import { CreateProject } from '@rxap/ts-morph';
import {
  Project,
  SourceFile,
  WriterFunction,
} from 'ts-morph';
import { ToMappingObject } from './to-mapping-object';

function toPlain(sourceFile: SourceFile): string {
  return sourceFile.getText().replace(/\n/g, '').replace(/\s\s+/g, ' ');
}

function writeTo(sourceFile: SourceFile, writeFunction: WriterFunction) {
  sourceFile.addVariableStatement({
    declarations: [
      {
        name: 'test',
        initializer: writeFunction,
      },
    ],
  });
}

describe('ToMappingObject', () => {

  let project: Project;
  let sourceFile: SourceFile;

  beforeEach(() => {
    project = CreateProject();
    sourceFile = project.createSourceFile('test.ts', '');
  });

  it('should return mapping object', () => {
    const writeFunction = ToMappingObject({ 'key': 'value' });
    writeTo(sourceFile, writeFunction);
    expect(toPlain(sourceFile)).toEqual(`let test = { key: value };`);
  });

  it('should return mapping object with base property', () => {
    const writeFunction = ToMappingObject({ 'key': 'value' }, { baseProperty: 'test' });
    writeTo(sourceFile, writeFunction);
    expect(toPlain(sourceFile)).toEqual(`let test = { key: test.value };`);
  });

  it('should return mapping object with alias', () => {
    const writeFunction = ToMappingObject({
      'key': 'value',
      'test': 'new',
    }, { aliasFnc: (_, value) => value === 'new' ? 'nice' : value });
    writeTo(sourceFile, writeFunction);
    expect(toPlain(sourceFile)).toEqual(`let test = { key: value, test: nice };`);
  });

  it('should return mapping object with complex', () => {
    const writeFunction = ToMappingObject({
      'key': 'value',
      'sub': {
        'id': 'rowId',
        'name': 'user.name',
      },
    });
    writeTo(sourceFile, writeFunction);
    expect(toPlain(sourceFile)).toEqual(`let test = { key: value, sub: { id: rowId, name: user.name } };`);
  });

  it('should return mapping object with complex and base property', () => {
    const writeFunction = ToMappingObject({
      'key': 'value',
      'sub': {
        'id': 'rowId',
        'name': 'user.name',
      },
    }, { baseProperty: 'test' });
    writeTo(sourceFile, writeFunction);
    expect(toPlain(sourceFile)).toEqual(
      `let test = { key: test.value, sub: { id: test.rowId, name: test.user.name } };`);
  });

  it('should return mapping object with complex and alias', () => {
    const writeFunction = ToMappingObject({
      'key': 'value',
      'sub': {
        'id': 'rowId',
        'name': 'user.name',
      },
    }, { aliasFnc: (_, value) => value === 'rowId' ? 'nice' : value });
    writeTo(sourceFile, writeFunction);
    expect(toPlain(sourceFile)).toEqual(`let test = { key: value, sub: { id: nice, name: user.name } };`);
  });

});
