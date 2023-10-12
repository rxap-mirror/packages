import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
} from 'ts-morph';
import { NestProviderObject } from './nest-provider-object';

export function RemoveNestProviderToArray(
  providerObject: NestProviderObject | string,
  providerArray: ArrayLiteralExpression,
  overwrite: boolean | string[] = false,
) {

  if (typeof providerObject === 'string') {

    const element = providerArray.getElements().find(element => element.getText().trim() === providerObject);
    if (element) {
      providerArray.removeElement(element.getChildIndex());
    }

  } else {

    const index = providerArray.getElements().findIndex(element => {
      if (element instanceof ObjectLiteralExpression) {
        const provideProperty = element.getProperty('provide');
        if (provideProperty instanceof PropertyAssignment) {
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
