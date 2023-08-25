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
  name: string,
  structures?: Array<OptionalKind<ImportDeclarationStructure>>;
  overwrite?: boolean;
  moduleSpecifier?: string;
}

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
