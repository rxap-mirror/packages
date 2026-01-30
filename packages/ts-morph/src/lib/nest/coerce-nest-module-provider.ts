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
  /**
   * The provider to add.
   */
  providerObject: NestProviderObject | string,
  /**
   * Module specifier for the provider import.
   */
  moduleSpecifier?: string,
  /**
   * Additional import structures.
   */
  structures?: Array<OptionalKind<ImportDeclarationStructure>>,
  /**
   * If true, overwrites existing provider.
   */
  overwrite?: boolean,
}

/**
 * Coerces a provider in a NestJS module.
 *
 * @param sourceFile - The source file containing the module.
 * @param options - Options for the provider (provider object, module specifier, etc.).
 */
export function CoerceNestModuleProvider(
  sourceFile: SourceFile,
  options: CoerceNestModuleProviderOptions,
) {

  const {
    providerObject,
    overwrite,
    moduleSpecifier,
  } = options;

  let { structures } = options;

  structures ??= [];
  if (moduleSpecifier && typeof providerObject === 'string') {
    structures.push({
      moduleSpecifier,
      namedImports: [ providerObject ],
    });
  }

  CoerceImports(sourceFile, structures);

  const metadata = GetNestModuleMetadata(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'providers');

  CoerceNestProviderToArray(providerObject, providerArray, overwrite);

}
