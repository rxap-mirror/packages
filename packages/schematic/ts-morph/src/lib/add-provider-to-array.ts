import { DeleteUndefinedProperties } from '@rxap/schematics-utilities';
import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  Writers,
} from 'ts-morph';
import { ProviderObject } from './provider-object';

export function AddProviderToArray(
  providerObject: ProviderObject | string,
  providerArray: ArrayLiteralExpression,
  overwrite = false,
  compare: (ole: ObjectLiteralExpression, po: ProviderObject) => boolean = (ole, po) => {
    const provideProperty = ole.getProperty('provide');

    if (provideProperty instanceof PropertyAssignment) {

      return provideProperty.getInitializer()?.getFullText().trim() === po.provide;

    }
    return false;
  },
) {

  if (typeof providerObject === 'string') {

    if (!providerArray.getElements().some(element => element.getFullText().trim() === providerObject)) {
      providerArray.addElement(providerObject);
    }

  } else {

    const index = providerArray.getElements().findIndex(element => {

      if (element instanceof ObjectLiteralExpression) {
        return compare(element, providerObject);
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
        deps: providerObject.deps ? Array.isArray(providerObject.deps) ? `[ ${providerObject.deps.join(',')} ]` : providerObject.deps : undefined,
        multi: providerObject.multi === true ? w => w.write('true') : providerObject.multi === false ? w => w.write('false') : undefined,
      })));
    }

  }

}
