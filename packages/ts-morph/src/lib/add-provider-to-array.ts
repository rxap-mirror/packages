import { DeleteUndefinedProperties } from '@rxap/utilities';
import {
  ArrayLiteralExpression,
  Expression,
  ObjectLiteralExpression,
  PropertyAssignment,
  SyntaxKind,
  Writers,
} from 'ts-morph';
import { ProviderObject } from './provider-object';

/**
 * Adds a provider to an Angular or NestJS provider array.
 *
 * @param providerObject - The provider to add. Can be a string (class name) or a ProviderObject.
 * @param providerArray - The array literal expression to add the provider to.
 * @param overwrite - If true, overwrites the existing provider. If an array of strings, it specifies which properties to overwrite.
 * @param compare - A function to compare an existing object literal expression with the provider object to determine if it exists.
 * @returns The added or updated expression in the array.
 */
export function AddProviderToArray(
  providerObject: ProviderObject | string,
  providerArray: ArrayLiteralExpression,
  overwrite: boolean | string[] = false,
  compare: (ole: ObjectLiteralExpression, po: ProviderObject) => boolean = (ole, po) => {
    const provideProperty = ole.getProperty('provide');

    if (provideProperty?.isKind(SyntaxKind.PropertyAssignment)) {

      return provideProperty.getInitializer()?.getText().trim() === po.provide;

    }
    return false;
  },
): Expression {

  let expression: Expression;

  if (typeof providerObject === 'string') {

    const index = providerArray.getElements().findIndex(element => {
      const text = element.getText().trim();
      if (text === providerObject) {
        return true;
      }
      const match = providerObject.match(/^[a-zA-Z0-9]+?\(/);
      if (match) {
        return text.startsWith(match[0]);
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

      if (element.isKind(SyntaxKind.ObjectLiteralExpression)) {
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
