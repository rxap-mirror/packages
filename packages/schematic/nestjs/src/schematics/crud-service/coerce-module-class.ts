import { CoerceClass } from '@rxap/schematics-ts-morph';
import {
  DecoratorStructure,
  OptionalKind,
  Scope,
  SourceFile,
} from 'ts-morph';
import { CoerceSuffix } from '@rxap/schematics-utilities';

export function CoerceModuleClass(sourceFile: SourceFile, moduleName: string, global = false): void {

  const decorators: Array<OptionalKind<DecoratorStructure>> = [
    {
      name: 'Module',
      arguments: [ '{}' ],
    },
  ];


  if (global) {
    decorators.unshift({
      name: 'Global',
      arguments: [],
    });
  }

  const className = CoerceSuffix(moduleName, 'Module');

  CoerceClass(sourceFile, className, {
    isExported: true,
    decorators,
  });

  sourceFile.addImportDeclarations([
    {
      namedImports: [ 'Global', 'Module', 'Inject' ],
      moduleSpecifier: '@nestjs/common',
    },
  ]);

}
