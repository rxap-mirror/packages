import { NestProviderObject } from './nest-provider-object';
import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  Writers,
} from 'ts-morph';
import { DeleteUndefinedProperties } from '@rxap/schematics-utilities';

export function AddNestProviderToArray(
  providerObject: NestProviderObject | string,
  providerArray: ArrayLiteralExpression,
  overwrite = false,
) {

  if (typeof providerObject === 'string') {

    if (!providerArray.getElements().some(element => element.getFullText().trim() === providerObject)) {
      providerArray.addElement(providerObject);
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

    if (overwrite || index === -1) {
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
