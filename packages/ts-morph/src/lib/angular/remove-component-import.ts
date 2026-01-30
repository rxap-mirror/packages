import {
  GetArrayLiteralFromObjectLiteral,
  GetComponentClass,
  GetComponentDecoratorObject,
  IsTypeImport,
  TypeImport,
} from '@rxap/ts-morph';
import {
  ClassDeclaration,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';

/**
 * Removes a component import from an Angular component's `imports` array.
 * Also removes the import declaration from the file.
 *
 * @param sourceFileOrClassDeclaration - The source file or class declaration.
 * @param componentImport - The name or TypeImport of the component to remove.
 */
export function RemoveComponentImport(
  sourceFileOrClassDeclaration: SourceFile | ClassDeclaration,
  componentImport: string | TypeImport,
) {

  const classDeclaration = sourceFileOrClassDeclaration.isKind(SyntaxKind.ClassDeclaration) ? sourceFileOrClassDeclaration : GetComponentClass(sourceFileOrClassDeclaration);
  const sourceFile = sourceFileOrClassDeclaration.isKind(SyntaxKind.SourceFile) ? sourceFileOrClassDeclaration : sourceFileOrClassDeclaration.getSourceFile();

  const importName = typeof componentImport === 'string' ? componentImport : componentImport.namedImport ?? componentImport.name;

  sourceFile.getImportDeclaration(importDeclaration => importDeclaration.getNamedImports().some(namedImport => namedImport.getName() === importName))?.remove();

  if (IsTypeImport(componentImport) && componentImport.moduleSpecifier) {
    sourceFile.getImportDeclaration(componentImport.moduleSpecifier)?.remove();
  }

  const componentDecoratorObject = GetComponentDecoratorObject(classDeclaration);

  const importsArray = GetArrayLiteralFromObjectLiteral(componentDecoratorObject, 'imports');

  const element = importsArray?.getElements().find(e => e.getText().includes(importName));
  if (element) {
    importsArray?.removeElement(element);
  }

}
