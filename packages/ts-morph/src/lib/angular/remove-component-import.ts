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
} from 'ts-morph';

export function RemoveComponentImport(
  sourceFileOrClassDeclaration: SourceFile | ClassDeclaration,
  componentImport: string | TypeImport,
) {

  const classDeclaration = sourceFileOrClassDeclaration instanceof ClassDeclaration ? sourceFileOrClassDeclaration : GetComponentClass(sourceFileOrClassDeclaration);
  const sourceFile = sourceFileOrClassDeclaration instanceof SourceFile ? sourceFileOrClassDeclaration : sourceFileOrClassDeclaration.getSourceFile();

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
