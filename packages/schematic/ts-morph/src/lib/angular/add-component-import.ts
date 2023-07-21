import { SourceFile } from 'ts-morph';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { GetComponentOptionsObject } from './get-component-options-object';

export function AddComponentImport(sourceFile: SourceFile, namedImport: string, moduleSpecifier?: string) {

  if (moduleSpecifier) {
    CoerceImports(sourceFile, {
      moduleSpecifier,
      namedImports: [ namedImport ],
    });
  }

  const ngModuleOptions = GetComponentOptionsObject(sourceFile);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(ngModuleOptions, 'imports');

  if (!importsArray.getElements().some(element => element.getFullText().trim() === namedImport)) {
    importsArray.addElement(namedImport);
  }

}
