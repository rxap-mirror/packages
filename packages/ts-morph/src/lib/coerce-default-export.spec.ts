import { CoerceDefaultExport } from '@rxap/ts-morph';
import { Project } from 'ts-morph';
import { CoerceVariableDeclaration } from './coerce-variable-declaration';
import { CreateProject } from './create-project';

describe('CoerceDefaultExport', () => {

  let project: Project;

  beforeEach(() => {
    project = CreateProject();
  });

  it('should coerce default export', () => {

    const sourceFile = project.createSourceFile('test.ts');

    const variableDeclaration = CoerceVariableDeclaration(sourceFile, 'test', {
      initializer: w => w.quote('test')
    });

    CoerceDefaultExport(variableDeclaration);

    expect(sourceFile.getFullText()).toEqual(`export const test = 'test';

export default test;
`);

  });

});
