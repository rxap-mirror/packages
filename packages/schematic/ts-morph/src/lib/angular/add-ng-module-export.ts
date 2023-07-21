import { SourceFile } from 'ts-morph';
import {
  GetCoerceArrayLiteralFromObjectLiteral,
  GetNgModuleOptionsObject,
} from '@rxap/schematics-ts-morph';
import { CoerceImports } from '../ts-morph/coerce-imports';

export function AddNgModuleExport(sourceFile: SourceFile, namedImport: string, moduleSpecifier?: string) {

  if (moduleSpecifier) {
    CoerceImports(sourceFile, {
      moduleSpecifier,
      namedImports: [ namedImport ],
    });
  }

  const ngModuleOptions = GetNgModuleOptionsObject(sourceFile);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(ngModuleOptions, 'exports');

  if (!importsArray.getElements().some(element => element.getFullText().trim() === namedImport)) {
    importsArray.addElement(namedImport);
  }

}
