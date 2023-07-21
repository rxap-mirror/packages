import { SourceFile } from 'ts-morph';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { GetComponentOptionsObject } from './get-component-options-object';

export function AddComponentAnimations(sourceFile: SourceFile, namedImport: string, moduleSpecifier: string) {

  CoerceImports(sourceFile, {
    moduleSpecifier,
    namedImports: [ namedImport ],
  });

  const componentOptions = GetComponentOptionsObject(sourceFile);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(componentOptions, 'animations');

  if (!importsArray.getElements().some(element => element.getFullText().trim() === namedImport)) {
    importsArray.addElement(namedImport);
  }

}
