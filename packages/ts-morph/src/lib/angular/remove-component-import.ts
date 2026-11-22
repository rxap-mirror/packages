import {
  GetArrayLiteralFromObjectLiteral,
  GetComponentClass,
  GetComponentDecoratorObject,
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

  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    const namedImport = importDeclaration.getNamedImports().find(n => n.getName() === importName);
    if (!namedImport) {
      continue;
    }
    // only remove the whole declaration if no other binding shares it
    if (importDeclaration.getNamedImports().length === 1 && !importDeclaration.getDefaultImport() && !importDeclaration.getNamespaceImport()) {
      importDeclaration.remove();
    } else {
      namedImport.remove();
    }
  }

  if (typeof componentImport !== 'string' && componentImport.moduleSpecifier) {
    const declaration = sourceFile.getImportDeclaration(componentImport.moduleSpecifier);
    // a default/namespace import of the module specifier; keep it if named imports remain
    if (declaration && declaration.getNamedImports().length === 0) {
      declaration.remove();
    }
  }

  const componentDecoratorObject = GetComponentDecoratorObject(classDeclaration);

  const importsArray = GetArrayLiteralFromObjectLiteral(componentDecoratorObject, 'imports');

  const element = importsArray?.getElements().find(e => e.getText().includes(importName));
  if (element) {
    importsArray?.removeElement(element);
  }

}
