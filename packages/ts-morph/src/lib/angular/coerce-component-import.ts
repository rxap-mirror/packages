import {
  CoerceArrayElement,
  GetComponentClass,
} from '@rxap/ts-morph';
import { CoerceImports } from '../coerce-imports';
import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { GetComponentDecoratorObject } from './get-component-decorator-object';

/**
 * Coerces the component import by adding it to the imports array of the component decorator object.
 * If a module specifier is provided, the import is also coerced at the file level.
 *
 * @param {SourceFile | ClassDeclaration} sourceFileOrClassDeclaration - The source file or class declaration that contains the component import.
 * @param {string} importName - The name of the import to coerce.
 * @param {string} [moduleSpecifier] - The module specifier for the import (optional).
 * @returns {Array} - The updated imports array after coercing the import.
 */
export function CoerceComponentImport(
  sourceFileOrClassDeclaration: SourceFile | ClassDeclaration,
  importName: string,
  moduleSpecifier?: string
) {

  const classDeclaration = sourceFileOrClassDeclaration instanceof ClassDeclaration ? sourceFileOrClassDeclaration : GetComponentClass(sourceFileOrClassDeclaration);
  const sourceFile = sourceFileOrClassDeclaration instanceof SourceFile ? sourceFileOrClassDeclaration : sourceFileOrClassDeclaration.getSourceFile();


  if (moduleSpecifier) {
    CoerceImports(sourceFile, {
      moduleSpecifier,
      namedImports: [ importName ],
    });
  }

  const componentDecoratorObject = GetComponentDecoratorObject(classDeclaration);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(componentDecoratorObject, 'imports');

  CoerceArrayElement(importsArray, importName);

  return importsArray;

}
