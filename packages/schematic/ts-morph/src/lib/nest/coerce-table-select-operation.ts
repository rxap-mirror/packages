import {
  DataProperty,
  NormalizeDataProperty,
  NormalizedDataProperty,
} from '@rxap/ts-morph';
import {
  CoerceGetPageOperation,
  CoerceGetPageOperationOptions,
} from './coerce-get-page-operation';

export interface CoerceTableSelectOperationOptions extends CoerceGetPageOperationOptions {
  rowIdProperty: DataProperty;
  rowDisplayProperty: NormalizedDataProperty;
  rowValueProperty?: NormalizedDataProperty;
}

export function CoerceTableSelectOperationRule(options: CoerceTableSelectOperationOptions) {
  const {
    propertyList = [],
    rowIdProperty,
    rowDisplayProperty,
    rowValueProperty = NormalizeDataProperty(rowIdProperty),
  } = options;

  propertyList.unshift({
    ...rowDisplayProperty,
    name: '__display',
    source: rowDisplayProperty.name,
  });
  propertyList.unshift({
    ...rowValueProperty,
    name: '__value',
    source: rowValueProperty.name,
  });

  return CoerceGetPageOperation({
    ...options,
    propertyList: propertyList,
    rowIdProperty,
  });

}
