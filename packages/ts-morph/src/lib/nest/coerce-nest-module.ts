import { classify } from '@rxap/utilities';
import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceImports } from '../coerce-imports';

export interface CoerceNestModuleOptions {
  /**
   * The name of the module (without 'Module' suffix).
   */
  name: string;
  /**
   * Custom transform function to modify the module class.
   */
  tsMorphTransform?: (sourceFile: SourceFile, classDeclaration: ClassDeclaration) => void;
}

/**
 * Coerces a NestJS module class declaration.
 * Creates the module class and decorates it with @Module.
 *
 * @param sourceFile - The source file to add the module to.
 * @param options - Options for the module (name, transform function).
 * @returns The class declaration for the module.
 */
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
