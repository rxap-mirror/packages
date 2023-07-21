import { SourceFile } from 'ts-morph';
import { NestProviderObject } from './nest-provider-object';
import { GetNestModuleMetadata } from './get-nest-module-metadata';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { RemoveNestProviderToArray } from './remove-nest-provider-to-array';

export function RemoveNestModuleProvider(
  sourceFile: SourceFile,
  providerObject: NestProviderObject | string,
) {


  const metadata = GetNestModuleMetadata(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'providers');

  RemoveNestProviderToArray(providerObject, providerArray);

}
