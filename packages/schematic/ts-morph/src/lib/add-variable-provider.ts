import {
  ArrayLiteralExpression,
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';
import { AddProviderToArray } from './add-provider-to-array';
import { ProviderObject } from './provider-object';
import { CoerceVariableDeclaration } from './coerce-variable-declaration';
import { CoerceImports } from './ts-morph/index';

export function AddVariableProvider(
  sourceFile: SourceFile,
  variableName: string,
  providerObject: ProviderObject | string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite = false,
) {

  CoerceImports(sourceFile, structures);

  const variableDeclaration = CoerceVariableDeclaration(
    sourceFile,
    variableName,
    {
      initializer: '[]',
      type: 'Provider[]',
    },
  );

  CoerceImports(sourceFile, {
    namedImports: [ 'Provider' ],
    moduleSpecifier: '@angular/core',
  });

  const providerArray = variableDeclaration.getInitializer();

  if (!(providerArray instanceof ArrayLiteralExpression)) {
    throw new Error(`The variable '${ variableName }' initializer is not an array literal expression`);
  }

  AddProviderToArray(providerObject, providerArray, overwrite);

}
