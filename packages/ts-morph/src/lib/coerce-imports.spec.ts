import {
  IndentationText,
  Project,
  QuoteKind,
  SourceFile,
} from 'ts-morph';
import { CoerceImports } from './coerce-imports';

describe('CoerceImports', () => {

  let project: Project;
  let sourceFile: SourceFile;

  beforeEach(() => {
    project = new Project({
      useInMemoryFileSystem: true,
      manipulationSettings: {
        indentationText: IndentationText.TwoSpaces,
        quoteKind: QuoteKind.Single,
        useTrailingCommas: true,
      },
    });
    sourceFile = project.createSourceFile('test.ts', '');
  });

  it('should not throw if only the moduleSpecifier property is given', () => {
    expect(() => {
      CoerceImports(sourceFile, {
        moduleSpecifier: '@angular/core',
      });
    }).not.toThrow();
    expect(sourceFile.getFullText()).toEqual('');
  });

  it('should handle array of structures', () => {
    expect(() => {
      CoerceImports(sourceFile, []);
    }).not.toThrow();
    expect(sourceFile.getFullText()).toEqual('');
  });

  it('should handle a single structure object', () => {
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Inject' ],
    });
    expect(sourceFile.getFullText()).toEqual(`import { Inject } from '@angular/core';\n`);
  });

  it('should add named imports if not already present', () => {
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Inject', 'Component' ],
    });
    expect(sourceFile.getFullText()).toEqual(`import { Inject, Component } from '@angular/core';\n`);
  });

  it('should handle adding named imports where some already exists', () => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Inject' ],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Inject', 'Component' ],
    });
    expect(sourceFile.getFullText()).toEqual(`import { Inject, Component } from '@angular/core';\n`);
  });

  it('should add default imports', () => {
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      defaultImport: 'core',
    });
    expect(sourceFile.getFullText()).toEqual(`import core from '@angular/core';\n`);
  });

  it('should handle case where default import already exists', () => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      defaultImport: 'old',
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      defaultImport: 'core',
    });
    expect(sourceFile.getFullText()).toEqual(`import core from '@angular/core';\n`);
  });

  it('should add namespace imports', () => {
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namespaceImport: 'ng',
    });
    expect(sourceFile.getFullText()).toEqual(`import * as ng from '@angular/core';\n`);
  });

  it('should handle case where namespace import already exists', () => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      namespaceImport: 'old',
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namespaceImport: 'ng',
    });
    expect(sourceFile.getFullText()).toEqual(`import * as ng from '@angular/core';\n`);
  });

  it('should throw if the named imports array contains WriteFunctions if moduleSpecifier is already in use', () => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Inject' ],
    });
    expect(() => {
      CoerceImports(sourceFile, {
        moduleSpecifier: '@angular/core',
        namedImports: [ 'Inject', w => w.write('Component') ],
      });
    }).toThrow();
    expect(sourceFile.getFullText()).toEqual(`import { Inject } from '@angular/core';\n`);
  });

  it(
    'should not throw if the named imports array contains WriteFunctions if moduleSpecifier is not already in use',
    () => {
      expect(() => {
        CoerceImports(sourceFile, {
          moduleSpecifier: '@angular/core',
          namedImports: [ 'Inject', w => w.write('Component') ],
        });
      }).not.toThrow();
      expect(sourceFile.getFullText()).toEqual(`import { Inject, Component } from '@angular/core';\n`);
    },
  );

  it('should handle the case where some existing imports are only type imports, but the new are not', () => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      isTypeOnly: true,
      namedImports: [ 'Inject' ],
    });
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Pipe' ],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Component' ],
    });
    expect(sourceFile.getFullText())
      .toEqual(`import type { Inject } from '@angular/core';\nimport { Pipe, Component } from '@angular/core';\n`);
  });

  it('should handle the case where some new imports are only type imports, but the existing are not', () => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Inject' ],
    });
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      isTypeOnly: true,
      namedImports: [ 'Component' ],
    });
    expect(sourceFile.getFullText())
      .toEqual(`import { Inject } from '@angular/core';\nimport { type Component } from '@angular/core';\n`);
  });

  it('should add type import if not already present', () => {
    CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Component' ],
      isTypeOnly: true,
    });
    expect(sourceFile.getFullText()).toEqual(`import { type Component } from '@angular/core';\n`);
  });

  it('should handle the case that a named import exists an a namespace import is added', () => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Inject' ],
    });
    expect(() => CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namespaceImport: 'ng',
    })).not.toThrow();
    expect(sourceFile.getFullText())
      .toEqual(`import { Inject } from '@angular/core';\nimport * as ng from '@angular/core';\n`);
  });

  it('should handle the case that a named import exists an a default import is added', () => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Inject' ],
    });
    expect(() => CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      defaultImport: 'ng',
    })).not.toThrow();
    expect(sourceFile.getFullText()).toEqual(`import ng, { Inject } from '@angular/core';\n`);
  });

  it('should handle the case that a default import exists and a namespace import is added', () => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      defaultImport: 'core',
    });
    expect(() => CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namespaceImport: 'ng',
    })).not.toThrow();
    expect(sourceFile.getFullText())
      .toEqual(`import core from '@angular/core';\nimport * as ng from '@angular/core';\n`);
  });

  it('should handle the case that a default import exists and a type import is added', () => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      defaultImport: 'core',
    });
    expect(() => CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Component' ],
      isTypeOnly: true,
    })).not.toThrow();
    expect(sourceFile.getFullText())
      .toEqual(`import core from '@angular/core';\nimport { type Component } from '@angular/core';\n`);
  });

  it('should handle the case that a namespace import exists and a named imported is added', () => {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/core',
      namespaceImport: 'ng',
    });
    expect(() => CoerceImports(sourceFile, {
      moduleSpecifier: '@angular/core',
      namedImports: [ 'Inject' ],
    })).not.toThrow();
    expect(sourceFile.getFullText())
      .toEqual(`import * as ng from '@angular/core';\nimport { Inject } from '@angular/core';\n`);
  });

});
