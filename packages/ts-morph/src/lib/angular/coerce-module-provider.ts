import {
  ClassDeclaration,
  ObjectLiteralExpression,
  SourceFile,
} from 'ts-morph';
import { AddProviderToArray } from '../add-provider-to-array';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { ProviderObject } from '../provider-object';
import { GetComponentClass } from './get-component-class';
import { GetComponentDecoratorObject } from './get-component-decorator-object';

export function CoerceModuleProvider(
  sourceFileOrClassDeclaration: SourceFile | ClassDeclaration | ObjectLiteralExpression,
  providerObject: ProviderObject | string,
) {

  let componentDecoratorObject: ObjectLiteralExpression;
  if (sourceFileOrClassDeclaration instanceof ObjectLiteralExpression) {
    componentDecoratorObject = sourceFileOrClassDeclaration;
  } else if (sourceFileOrClassDeclaration instanceof ClassDeclaration) {
    componentDecoratorObject = GetComponentDecoratorObject(sourceFileOrClassDeclaration);
  } else {
    componentDecoratorObject = GetComponentDecoratorObject(GetComponentClass(sourceFileOrClassDeclaration));
  }

  const providersArray = GetCoerceArrayLiteralFromObjectLiteral(componentDecoratorObject, 'providers');

  AddProviderToArray(providerObject, providersArray);

  return providersArray;

}
