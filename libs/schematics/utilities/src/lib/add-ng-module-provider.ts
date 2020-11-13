import {
  SourceFile,
  OptionalKind,
  ImportDeclarationStructure
} from 'ts-morph';
import { ProviderObject } from './provider-object';
import { GetNgModuleOptionsObject } from './get-ng-module-options-object';
import { GetCoerceArrayLiteralFromObjectLiteral } from './get-coerce-array-literal-form-object-literal';
import { AddProviderToArray } from './add-provider-to-array';

export function AddNgModuleProvider(
  sourceFile: SourceFile,
  providerObject: ProviderObject | string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = []
) {

  sourceFile.addImportDeclarations(structures);

  const ngModuleOptions = GetNgModuleOptionsObject(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(ngModuleOptions, 'providers');

  AddProviderToArray(providerObject, providerArray);

}
