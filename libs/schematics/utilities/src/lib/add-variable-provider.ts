import {
  SourceFile,
  OptionalKind,
  ImportDeclarationStructure,
  ArrayLiteralExpression
} from 'ts-morph';
import { AddProviderToArray } from './add-provider-to-array';
import { ProviderObject } from './provider-object';
import { CoerceVariableDeclaration } from './coerce-variable-declaration';

export function AddVariableProvider(
  sourceFile: SourceFile,
  variableName: string,
  providerObject: ProviderObject | string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite: boolean                                                  = false
) {

  sourceFile.addImportDeclarations(structures);

  const variableDeclaration = CoerceVariableDeclaration(
    sourceFile,
    variableName,
    {
      name:        variableName,
      initializer: '[]',
      type:        'Provider[]'
    }
  );

  sourceFile.addImportDeclaration({
    namedImports:    [ 'Provider' ],
    moduleSpecifier: '@angular/core'
  });

  const providerArray = variableDeclaration.getInitializer();

  if (!(providerArray instanceof ArrayLiteralExpression)) {
    throw new Error(`The variable '${variableName}' initializer is not an array literal expression`);
  }

  AddProviderToArray(providerObject, providerArray, overwrite);

}
