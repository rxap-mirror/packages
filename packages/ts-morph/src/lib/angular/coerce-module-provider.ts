import {
  ClassDeclaration,
  ObjectLiteralExpression,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { AddProviderToArray } from '../add-provider-to-array';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';
import { ProviderObject } from '../provider-object';
import { GetComponentClass } from './get-component-class';
import { GetComponentDecoratorObject } from './get-component-decorator-object';

/**
 * Coerces a provider in an Angular module (or component) `providers` array.
 * Adds the provider to the providers array of the component/module decorator.
 *
 * @param sourceFileOrClassDeclaration - The source file, class declaration, or object literal (decorator options).
 * @param providerObject - The provider to add.
 * @returns The providers array literal expression.
 */
export function CoerceModuleProvider(
  sourceFileOrClassDeclaration: SourceFile | ClassDeclaration | ObjectLiteralExpression,
  providerObject: ProviderObject | string,
) {

  let componentDecoratorObject: ObjectLiteralExpression;
  if (sourceFileOrClassDeclaration.isKind(SyntaxKind.ObjectLiteralExpression)) {
    componentDecoratorObject = sourceFileOrClassDeclaration;
  } else if (sourceFileOrClassDeclaration.isKind(SyntaxKind.ClassDeclaration)) {
    componentDecoratorObject = GetComponentDecoratorObject(sourceFileOrClassDeclaration);
  } else {
    componentDecoratorObject = GetComponentDecoratorObject(GetComponentClass(sourceFileOrClassDeclaration));
  }

  const providersArray = GetCoerceArrayLiteralFromObjectLiteral(componentDecoratorObject, 'providers');

  AddProviderToArray(providerObject, providersArray);

  return providersArray;

}
