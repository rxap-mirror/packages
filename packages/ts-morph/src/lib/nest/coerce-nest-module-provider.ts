import {
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';
import { CoerceImports } from '../coerce-imports';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { CoerceNestProviderToArray } from './coerce-nest-provider-to-array';
import { GetNestModuleMetadata } from './get-nest-module-metadata';
import { NestProviderObject } from './nest-provider-object';

export interface CoerceNestModuleProviderOptions {
  providerObject: NestProviderObject | string,
  structures?: ReadonlyArray<OptionalKind<ImportDeclarationStructure>>,
  overwrite?: boolean,
}

export function CoerceNestModuleProvider(
  sourceFile: SourceFile,
  options: CoerceNestModuleProviderOptions,
) {

  const {
    providerObject,
    structures,
    overwrite,
  } = options;

  CoerceImports(sourceFile, structures ?? []);

  const metadata = GetNestModuleMetadata(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'providers');

  CoerceNestProviderToArray(providerObject, providerArray, overwrite);

}
