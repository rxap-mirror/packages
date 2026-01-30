import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  SyntaxKind,
} from 'ts-morph';
import { NestProviderObject } from './nest-provider-object';

/**
 * Removes a provider from a NestJS provider array.
 *
 * @param providerObject - The provider to remove.
 * @param providerArray - The array literal expression.
 * @param overwrite - (Unused param, kept for signature compatibility).
 */
export function RemoveNestProviderToArray(
  providerObject: NestProviderObject | string,
  providerArray: ArrayLiteralExpression,
  overwrite: boolean | string[] = false,
) {

  if (typeof providerObject === 'string') {

    const index = providerArray.getElements().findIndex(element => element.getText().trim() === providerObject);
    if (index !== -1) {
      providerArray.removeElement(index);
    }

  } else {

    const index = providerArray.getElements().findIndex(element => {
      if (element.isKind(SyntaxKind.ObjectLiteralExpression)) {
        const provideProperty = element.getProperty('provide');
        if (provideProperty?.isKind(SyntaxKind.PropertyAssignment)) {
          return provideProperty.getInitializer()?.getText().trim() === providerObject.provide;
        }
      }
      return false;
    });

    if ((
          overwrite === true || (
                      Array.isArray(overwrite) && overwrite.includes('provider')
                    )
        ) && index !== -1) {
      providerArray.removeElement(index);
    }

  }

}
