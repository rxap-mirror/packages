import { DeleteUndefinedProperties } from '@rxap/utilities';
import {
  ArrayLiteralExpression,
  Expression,
  ObjectLiteralExpression,
  PropertyAssignment,
  Writers,
} from 'ts-morph';
import { ProviderObject } from './provider-object';

/**
 * @deprecated import from @rxap/ts-morph
 */
export function AddProviderToArray(
  providerObject: ProviderObject | string,
  providerArray: ArrayLiteralExpression,
  overwrite: boolean | string[] = false,
  compare: (ole: ObjectLiteralExpression, po: ProviderObject) => boolean = (ole, po) => {
    const provideProperty = ole.getProperty('provide');

    if (provideProperty instanceof PropertyAssignment) {

      return provideProperty.getInitializer()?.getText().trim() === po.provide;

    }
    return false;
  },
): Expression {

  let expression: Expression;

  if (typeof providerObject === 'string') {

    const index = providerArray.getElements().findIndex(element => {
      if (element.getText().trim() === providerObject) {
        return true;
      }
      const match = providerObject.match(/^[a-zA-Z0-9]+?\(/);
      if (match) {
        return element.getText().trim().startsWith(match[0]);
      }
      return false;
    });

    if (index === -1) {
      expression = providerArray.addElement(providerObject);
    } else if (overwrite) {
      providerArray.removeElement(index);
      expression = providerArray.insertElement(index, providerObject);
    } else {
      expression = providerArray.getElements()[index];
    }

  } else {

    let index = providerArray.getElements().findIndex(element => {

      if (element instanceof ObjectLiteralExpression) {
        return compare(element, providerObject);
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
      expression = providerArray.addElement(Writers.object(DeleteUndefinedProperties({
        provide: providerObject.provide,
        useClass: providerObject.useClass,
        useFactory: providerObject.useFactory,
        useExisting: providerObject.useExisting,
        useValue: providerObject.useValue,
        deps: providerObject.deps ?
          Array.isArray(providerObject.deps) ? `[ ${ providerObject.deps.join(',') } ]` : providerObject.deps :
          undefined,
        multi: providerObject.multi === true ?
          w => w.write('true') :
          providerObject.multi === false ? w => w.write('false') : undefined,
      })));
    } else {
      expression = providerArray.getElements()[index];
    }

  }

  return expression;

}
