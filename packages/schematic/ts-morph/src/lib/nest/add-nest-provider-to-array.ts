import { DeleteUndefinedProperties } from '@rxap/schematics-utilities';
import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  Writers,
} from 'ts-morph';
import { NestProviderObject } from './nest-provider-object';

/**
 * @deprecated import from @rxap/ts-morph as CoerceNestProviderToArray
 */
export function AddNestProviderToArray(
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
