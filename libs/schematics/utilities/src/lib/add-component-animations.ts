import { SourceFile } from 'ts-morph';
import { GetComponentOptionsObject } from './get-component-options-object';
import { GetCoerceArrayLiteralFromObjectLiteral } from './get-coerce-array-literal-form-object-literal';

export function AddComponentAnimations(sourceFile: SourceFile, namedImport: string, moduleSpecifier: string) {

  sourceFile.addImportDeclaration({
    moduleSpecifier,
    namedImports: [ namedImport ]
  });

  const componentOptions = GetComponentOptionsObject(sourceFile);

  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(componentOptions, 'animations');

  if (!importsArray.getElements().some(element => element.getFullText().trim() === namedImport)) {
    importsArray.addElement(namedImport);
  }

}
