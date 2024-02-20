import {
  CoerceArrayElement,
  GetComponentClass,
  IsTypeImport,
  TypeImport,
  TypeImportToImportStructure,
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
 * @param sourceFileOrClassDeclaration - The source file or class declaration that contains the component import.
 * @param componentImport - The name or TypeImport of the import to coerce.
 * @returns - The updated imports array after coercing the import.
 */
export function CoerceComponentImport(
  sourceFileOrClassDeclaration: SourceFile | ClassDeclaration,
  componentImport: string | TypeImport,
) {

  const classDeclaration = sourceFileOrClassDeclaration instanceof ClassDeclaration ? sourceFileOrClassDeclaration : GetComponentClass(sourceFileOrClassDeclaration);
  const sourceFile = sourceFileOrClassDeclaration instanceof SourceFile ? sourceFileOrClassDeclaration : sourceFileOrClassDeclaration.getSourceFile();

  const importName = typeof componentImport === 'string' ? componentImport : componentImport.name;

  if (IsTypeImport(componentImport)) {
    CoerceImports(sourceFile, TypeImportToImportStructure(componentImport));
  }

  const componentDecoratorObject = GetComponentDecoratorObject(classDeclaration);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(componentDecoratorObject, 'imports');

  CoerceArrayElement(importsArray, importName);

  return importsArray;

}
