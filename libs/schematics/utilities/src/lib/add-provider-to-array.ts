import { ProviderObject } from './provider-object';
import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  Writers
} from 'ts-morph';
import { DeleteUndefinedProperties } from '@rxap/utilities';

export function AddProviderToArray(providerObject: ProviderObject | string, providerArray: ArrayLiteralExpression) {

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

    if (index === -1) {
      providerArray.addElement(Writers.object(DeleteUndefinedProperties({
        provide:     providerObject.provide,
        useClass:    providerObject.useClass,
        useFactory:  providerObject.useFactory,
        useExisting: providerObject.useExisting,
        useValue:    providerObject.useValue,
        deps:        providerObject.deps ? `[ ${providerObject.deps.join(',')} ]` : undefined
      })));
    }

  }

}
