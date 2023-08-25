import { classify } from '@rxap/utilities';
import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceImports } from '../coerce-imports';

export interface CoerceNestModuleOptions {
  name: string;
  tsMorphTransform?: (sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
}

export function CoerceNestModule(
  sourceFile: SourceFile,
  options: CoerceNestModuleOptions,
) {
  const { name } = options;
  let { tsMorphTransform } = options;
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {};

  const classDeclaration = CoerceClass(sourceFile, classify(name) + 'Module', {
    isExported: true,
    decorators: [
      {
        name: 'Module',
        arguments: [ '{}' ],
      },
    ],
  });
  CoerceImports(sourceFile, [
    {
      namedImports: [ 'Module' ],
      moduleSpecifier: '@nestjs/common',
    },
  ]);

  tsMorphTransform!(sourceFile, classDeclaration);

  return classDeclaration;

}
