import { SourceFile } from 'ts-morph';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { GetComponentOptionsObject } from './get-component-options-object';

/**
 * Adds a provided class to the imports array of the component.
 *
 * @param sourceFile - The source file where the component class is located.
 * @param namedImport - The name of the class that should be added to the imports array of the component.
 * @param [moduleSpecifier] - The module specifier to import the class into the source file.
 *
 * @returns {void}
 */
export function AddComponentImport(sourceFile: SourceFile, namedImport: string, moduleSpecifier?: string) {

  if (moduleSpecifier) {
    CoerceImports(sourceFile, {
      moduleSpecifier,
      namedImports: [ namedImport ],
    });
  }

  const ngModuleOptions = GetComponentOptionsObject(sourceFile);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(ngModuleOptions, 'imports');

  if (!importsArray.getElements().some(element => element.getText().trim() === namedImport)) {
    importsArray.addElement(namedImport);
  }

}
