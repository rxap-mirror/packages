import { SourceFile } from 'ts-morph';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { GetNestModuleMetadata } from './get-nest-module-metadata';
import { NestProviderObject } from './nest-provider-object';
import { RemoveNestProviderToArray } from './remove-nest-provider-to-array';

export function RemoveNestModuleProvider(
  sourceFile: SourceFile,
  providerObject: NestProviderObject | string,
) {


  const metadata = GetNestModuleMetadata(sourceFile);

  const providerArray = GetCoerceArrayLiteralFromObjectLiteral(metadata, 'providers');

  RemoveNestProviderToArray(providerObject, providerArray);

}
