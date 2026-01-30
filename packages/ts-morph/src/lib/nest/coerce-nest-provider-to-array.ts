import { DeleteUndefinedProperties } from '@rxap/utilities';
import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  SyntaxKind,
  Writers,
} from 'ts-morph';
import { NestProviderObject } from './nest-provider-object';

/**
 * Adds a provider to a NestJS provider array.
 * Can add string providers (class names) or provider objects.
 *
 * @param providerObject - The provider to add.
 * @param providerArray - The array literal expression.
 * @param overwrite - If true, overwrites the existing provider.
 */
export function CoerceNestProviderToArray(
  providerObject: NestProviderObject | string,
  providerArray: ArrayLiteralExpression,
  overwrite: boolean | string[] = false,
) {

  if (typeof providerObject === 'string') {

    if (!providerArray.getElements().some(element => element.getText().trim() === providerObject)) {
      providerArray.addElement(providerObject);
    }

  } else {

    let index = providerArray.getElements().findIndex(element => {
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
      index = -1;
    }

    if (index === -1) {
      providerArray.addElement(Writers.object(DeleteUndefinedProperties({
        provide: providerObject.provide,
        useClass: providerObject.useClass,
        useFactory: providerObject.useFactory,
        useExisting: providerObject.useExisting,
        useValue: providerObject.useValue,
        scope: providerObject.scope,
        inject: providerObject.inject ?
          Array.isArray(providerObject.inject) ? `[ ${ providerObject.inject.join(',') } ]` : providerObject.inject :
          undefined,
      })));
    }

  }

}
