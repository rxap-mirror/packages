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
import { RemoveNestProviderToArray } from './remove-nest-provider-to-array';

export interface RemoveNestModuleProviderOptions {
  /**
   * The provider to remove.
   */
  providerObject: NestProviderObject | string,
}

/**
 * Removes a provider from a NestJS module `providers` array.
 *
 * @param sourceFile - The source file containing the module.
 * @param options - The provider object or name to remove.
 */
export function RemoveNestModuleProvider(
  sourceFile: SourceFile,
  options: RemoveNestModuleProviderOptions | NestProviderObject | string,
) {

  let providerObject: NestProviderObject | string;
  if (typeof options === 'string') {
    providerObject = options;
  } else if ('providerObject' in options) {
    providerObject = options.providerObject;
  } else {
    providerObject = options;
  }

  const metadata = GetNestModuleMetadata(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'providers');

  RemoveNestProviderToArray(providerObject, providerArray, true);

}
