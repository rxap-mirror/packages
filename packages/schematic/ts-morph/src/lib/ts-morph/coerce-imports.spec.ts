import {Project, SourceFile} from 'ts-morph';
import {CoerceImports} from './coerce-imports';

describe('CoerceImports', () => {

  let sourceFile: SourceFile;

  beforeEach(() => {
    const project = new Project({useInMemoryFileSystem: true});
    sourceFile = project.createSourceFile('test.ts', `import { Component } from '@angular/core';`);
  });

  it('should add the import if not exists', () => {

    CoerceImports(sourceFile, [
      {
        moduleSpecifier: '@angular/material',
        namedImports: ['MatFormField'],
      },
    ]);

    expect(sourceFile.getImportDeclarations()).toHaveLength(2);

  });

  it('should extend existing import if exists', () => {

    CoerceImports(sourceFile, [
      {
        moduleSpecifier: '@angular/core',
        namedImports: ['Component', 'Directive'],
      },
    ]);

    expect(sourceFile.getImportDeclarations()).toHaveLength(1);
    expect(sourceFile.getImportDeclaration('@angular/core')?.getNamedImports().map(named => named.getText()))
      .toEqual(['Component', 'Directive']);

  });

});
