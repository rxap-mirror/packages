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
    columnList,
    rowIdProperty,
    rowDisplayProperty,
    rowValueProperty,
  } = options;

  rowIdProperty ??= 'uuid';
  rowDisplayProperty ??= 'name';
  rowValueProperty ??= rowIdProperty;

  columnList.unshift({
    name: '__display',
    type: 'string',
    source: rowDisplayProperty,
  });
  columnList.unshift({
    name: '__value',
    type: 'string',
    source: rowValueProperty,
  });

  return CoerceGetPageOperation({
    ...options,
    columnList,
    rowIdProperty,
  });

}
