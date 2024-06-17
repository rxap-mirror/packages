import {
  ClassDeclaration,
  ObjectLiteralExpression,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { CoerceArrayElement } from '../coerce-array-element';
import { CoerceImports } from '../coerce-imports';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import {
  IsTypeImport,
  TypeImport,
  TypeImportToImportStructure,
} from '../type-import';
import { GetComponentClass } from './get-component-class';
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
  sourceFileOrClassDeclaration: SourceFile | ClassDeclaration | ObjectLiteralExpression,
  componentImport: string | TypeImport,
) {

  const sourceFile = sourceFileOrClassDeclaration.isKind(SyntaxKind.SourceFile) ? sourceFileOrClassDeclaration : sourceFileOrClassDeclaration.getSourceFile();

  let componentDecoratorObject: ObjectLiteralExpression;
  if (sourceFileOrClassDeclaration.isKind(SyntaxKind.ObjectLiteralExpression)) {
    componentDecoratorObject = sourceFileOrClassDeclaration;
  } else if (sourceFileOrClassDeclaration.isKind(SyntaxKind.ClassDeclaration)) {
    componentDecoratorObject = GetComponentDecoratorObject(sourceFileOrClassDeclaration);
  } else {
    componentDecoratorObject = GetComponentDecoratorObject(GetComponentClass(sourceFileOrClassDeclaration));
  }

  const importName = typeof componentImport === 'string' ? componentImport : componentImport.namedImport ?? componentImport.name;

  if (IsTypeImport(componentImport)) {
    CoerceImports(sourceFile, TypeImportToImportStructure(componentImport));
  }

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(componentDecoratorObject, 'imports');

  CoerceArrayElement(importsArray, importName);

  return importsArray;

}
