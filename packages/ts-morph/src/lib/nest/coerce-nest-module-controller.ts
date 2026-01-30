import {
  ImportDeclarationStructure,
  OptionalKind,
  SourceFile,
} from 'ts-morph';
import { CoerceImports } from '../coerce-imports';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { CoerceNestProviderToArray } from './coerce-nest-provider-to-array';
import { GetNestModuleMetadata } from './get-nest-module-metadata';

export interface CoerceNestModuleControllerOptions {
  /**
   * The name of the controller class.
   */
  name: string,
  /**
   * Additional import structures.
   */
  structures?: Array<OptionalKind<ImportDeclarationStructure>>;
  /**
   * If true, overwrites existing controller entry.
   */
  overwrite?: boolean;
  /**
   * Module specifier for the controller import.
   */
  moduleSpecifier?: string;
}

/**
 * Coerces a controller in a NestJS module `controllers` array.
 * Adds the controller to the module metadata.
 *
 * @param sourceFile - The source file containing the module.
 * @param options - Options for the controller (name, module specifier).
 */
export function CoerceNestModuleController(
  sourceFile: SourceFile,
  options: CoerceNestModuleControllerOptions,
) {

  const { name, overwrite, moduleSpecifier } = options;
  let { structures } = options;

  structures ??= [];

  if (moduleSpecifier) {
    structures.push({
      moduleSpecifier,
      namedImports: [ name ],
    });
  }

  CoerceImports(sourceFile, structures);

  const metadata = GetNestModuleMetadata(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'controllers');

  CoerceNestProviderToArray(name, providerArray, overwrite);

}
