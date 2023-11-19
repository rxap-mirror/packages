import {
  CoerceGetPageOperation,
  CoerceGetPageOperationOptions,
} from './coerce-get-page-operation';

export interface CoerceTableSelectOperationOptions extends CoerceGetPageOperationOptions {
  rowDisplayProperty?: string;
  rowValueProperty?: string;
}

export function CoerceTableSelectOperationRule(options: CoerceTableSelectOperationOptions) {
  let {
    propertyList,
    rowIdProperty,
    rowDisplayProperty,
    rowValueProperty,
  } = options;

  rowIdProperty ??= 'uuid';
  rowDisplayProperty ??= 'name';
  rowValueProperty ??= rowIdProperty;

  propertyList.unshift({
    name: '__display',
    type: { name: 'string' },
    source: rowDisplayProperty,
  });
  propertyList.unshift({
    name: '__value',
    type: { name: 'string' },
    source: rowValueProperty,
  });

  return CoerceGetPageOperation({
    ...options,
    propertyList: propertyList,
    rowIdProperty,
  });

}
