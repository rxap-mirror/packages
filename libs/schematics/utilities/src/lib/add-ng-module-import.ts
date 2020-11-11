import { SourceFile } from 'ts-morph';
import { GetNgModuleOptionsObject } from './get-ng-module-options-object';
import { GetCoerceArrayLiteralFromObjectLiteral } from './get-coerce-array-literal-form-object-literal';

export function AddNgModuleImport(sourceFile: SourceFile, namedImport: string, moduleSpecifier: string) {

  sourceFile.addImportDeclaration({
    moduleSpecifier,
    namedImports: [ namedImport ]
  });

  const ngModuleOptions = GetNgModuleOptionsObject(sourceFile);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(ngModuleOptions, 'imports');

  if (!importsArray.getElements().some(element => element.getFullText().trim() === namedImport)) {
    importsArray.addElement(namedImport);
  }

}
