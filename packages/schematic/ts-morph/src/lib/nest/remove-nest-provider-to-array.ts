import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
} from 'ts-morph';
import { NestProviderObject } from './nest-provider-object';

/**
 * @deprecated import from @rxap/ts-morph
 */
export function RemoveNestProviderToArray(
  providerObject: NestProviderObject | string,
  providerArray: ArrayLiteralExpression,
  overwrite = false,
) {

  if (typeof providerObject === 'string') {

    const element = providerArray.getElements().find(element => element.getFullText().trim() === providerObject);
    if (element) {
      providerArray.removeElement(element.getChildIndex());
    }

  } else {

    const index = providerArray.getElements().findIndex(element => {
      if (element instanceof ObjectLiteralExpression) {
        const provideProperty = element.getProperty('provide');
        if (provideProperty instanceof PropertyAssignment) {
          return provideProperty.getInitializer()?.getFullText().trim() === providerObject.provide;
        }
      }
      return false;
    });

    if (overwrite && index !== -1) {
      providerArray.removeElement(index);
    }

  }

}
