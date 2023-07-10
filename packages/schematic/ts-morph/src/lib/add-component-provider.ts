import {
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';
import { GetComponentOptionsObject } from './get-component-options-object';
import { GetCoerceArrayLiteralFromObjectLiteral } from './get-coerce-array-literal-form-object-literal';
import { ProviderObject } from './provider-object';
import { AddProviderToArray } from './add-provider-to-array';
import { CoerceImports } from './ts-morph/index';

export function AddComponentProvider(
  sourceFile: SourceFile,
  providerObject: ProviderObject | string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite = false,
) {

  CoerceImports(sourceFile, structures);

  const componentOptions = GetComponentOptionsObject(sourceFile);

  const providersArray = GetCoerceArrayLiteralFromObjectLiteral(componentOptions, 'providers');

  AddProviderToArray(providerObject, providersArray, overwrite);

}
