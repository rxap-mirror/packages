import {
  getMetadata,
  hasMetadata
} from '@rxap/utilities/reflect-metadata';
import {
  RXAP_TABLE_ACTION_METHOD_TYPE_METADATA,
  RXAP_TABLE_ACTION_METHOD_CHECK_FUNCTION_METADATA
} from './decorators';
import {
  TableRowActionMethod,
  TableRowActionTypeMethod,
  TableRowActionTypeSwitchMethod,
  RowActionCheckFunction
} from './types';

export function IsTableRowActionTypeSwitchMethod<Data extends Record<string, any>>(
  method: TableRowActionMethod<Data>
): method is TableRowActionTypeSwitchMethod<Data> {
  return !hasMetadata(
    RXAP_TABLE_ACTION_METHOD_TYPE_METADATA,
    method.constructor
  );
}

export function IsTableRowActionTypeMethod<Data extends Record<string, any>>(
  type: string
) {
  return (
    method: TableRowActionMethod<Data>
  ): method is TableRowActionTypeMethod<Data> => {
    return (
      getMetadata(
        RXAP_TABLE_ACTION_METHOD_TYPE_METADATA,
        method.constructor
      ) === type
    );
  };
}

export function HasTableRowActionCheckFunction(method: TableRowActionMethod<any>): boolean {
  return hasMetadata(
    RXAP_TABLE_ACTION_METHOD_CHECK_FUNCTION_METADATA,
    method.constructor
  );
}

export function GetTableRowActionCheckFunction<Data>(method: TableRowActionMethod<Data>): RowActionCheckFunction<Data> {
  const checkFunction = getMetadata<RowActionCheckFunction<Data>>(RXAP_TABLE_ACTION_METHOD_CHECK_FUNCTION_METADATA, method.constructor);
  if (!checkFunction) {
    throw new Error(`Extracted check function from '${method.constructor.name}' is empty`);
  }
  return checkFunction;
}
