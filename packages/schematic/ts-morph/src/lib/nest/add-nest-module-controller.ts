import {ImportDeclarationStructure, OptionalKind, SourceFile} from 'ts-morph';
import {GetCoerceArrayLiteralFromObjectLiteral} from '../get-coerce-array-literal-form-object-literal';
import {GetNestModuleMetadata} from './get-nest-module-metadata';
import {AddNestProviderToArray} from './add-nest-provider-to-array';
import {CoerceImports} from '../ts-morph/index';

export function AddNestModuleController(
  sourceFile: SourceFile,
  controller: string,
  structures: ReadonlyArray<OptionalKind<ImportDeclarationStructure>> = [],
  overwrite = false,
) {

  CoerceImports(sourceFile, structures);

  const metadata = GetNestModuleMetadata(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'controllers');

  AddNestProviderToArray(controller, providerArray, overwrite);

}
