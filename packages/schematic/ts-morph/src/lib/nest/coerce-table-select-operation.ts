import { NormalizedDataProperty } from '@rxap/ts-morph';
import { CoerceArrayItems } from '@rxap/utilities';
import {
  CoerceGetPageOperation,
  CoerceGetPageOperationOptions,
} from './coerce-get-page-operation';

export interface CoerceTableSelectOperationOptions extends CoerceGetPageOperationOptions {
  rowDisplayProperty: NormalizedDataProperty;
  rowValueProperty?: NormalizedDataProperty;
}

export function CoerceTableSelectOperationRule(options: CoerceTableSelectOperationOptions) {
  const {
    propertyList = [],
    idProperty,
    rowDisplayProperty,
    rowValueProperty = idProperty,
  } = options;

  if (!rowValueProperty) {
    throw new Error('The row value property is required');
  }

  CoerceArrayItems(propertyList, [
    {
      ...rowValueProperty,
      name: '__value',
      source: rowValueProperty.name,
    },
    {
      ...rowDisplayProperty,
      name: '__display',
      source: rowDisplayProperty.name,
    }
  ], { compareTo: (a, b) => a.name === b.name, unshift: true });

  return CoerceGetPageOperation({
    ...options,
    propertyList: propertyList,
    idProperty,
  });

}
