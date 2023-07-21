import {
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { GetNestModuleMetadata } from './get-nest-module-metadata';
import { AddNestProviderToArray } from './add-nest-provider-to-array';
import { NestProviderObject } from './nest-provider-object';
import { CoerceImports } from '../ts-morph/coerce-imports';

export function AddNestModuleProvider(
  sourceFile: SourceFile,
  providerObject: NestProviderObject | string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite = false,
) {

  CoerceImports(sourceFile, structures);

  const metadata = GetNestModuleMetadata(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'providers');

  AddNestProviderToArray(providerObject, providerArray, overwrite);

}
