import {
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';
import { AddProviderToArray } from '../add-provider-to-array';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { ProviderObject } from '../provider-object';
import { CoerceImports } from '../ts-morph/coerce-imports';
import { GetNgModuleOptionsObject } from './get-ng-module-options-object';

export function AddNgModuleProvider(
  sourceFile: SourceFile,
  providerObject: ProviderObject | string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite = false,
) {

  CoerceImports(sourceFile, structures);

  const ngModuleOptions = GetNgModuleOptionsObject(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(ngModuleOptions, 'providers');

  AddProviderToArray(providerObject, providerArray, overwrite);

}
