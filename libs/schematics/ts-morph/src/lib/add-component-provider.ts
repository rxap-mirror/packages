import {
  SourceFile,
  OptionalKind,
  ImportDeclarationStructure
} from 'ts-morph';
import { GetComponentOptionsObject } from './get-component-options-object';
import { GetCoerceArrayLiteralFromObjectLiteral } from './get-coerce-array-literal-form-object-literal';
import { ProviderObject } from './provider-object';
import { AddProviderToArray } from './add-provider-to-array';

export function AddComponentProvider(
  sourceFile: SourceFile,
  providerObject: ProviderObject | string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite: boolean                                                  = false
) {

  sourceFile.addImportDeclarations(structures);

  const componentOptions = GetComponentOptionsObject(sourceFile);

  const providersArray = GetCoerceArrayLiteralFromObjectLiteral(componentOptions, 'providers');

  AddProviderToArray(providerObject, providersArray, overwrite);

}
