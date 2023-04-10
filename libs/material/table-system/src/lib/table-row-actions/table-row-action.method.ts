import {
  getMetadata,
  hasMetadata
} from '@rxap/utilities/reflect-metadata';
import {
  RXAP_TABLE_ACTION_METHOD_METADATA,
  TableActionMethodOptions
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
  return getMetadata<TableActionMethodOptions>(
    RXAP_TABLE_ACTION_METHOD_METADATA,
    method.constructor
  )?.type === undefined;
}

export function IsTableRowActionTypeMethod<Data extends Record<string, any>>(
  type: string
) {
  return (
    method: TableRowActionMethod<Data>
  ): method is TableRowActionTypeMethod<Data> => {
    return (
      getMetadata<TableActionMethodOptions>(
        RXAP_TABLE_ACTION_METHOD_METADATA,
        method.constructor
      )?.type === type
    );
  };
}

export function HasTableRowActionCheckFunction(method: TableRowActionMethod<any>): boolean {
  return getMetadata<TableActionMethodOptions>(
    RXAP_TABLE_ACTION_METHOD_METADATA,
    method.constructor
  )?.checkFunction !== undefined;
}

export function GetTableRowActionCheckFunction<Data>(method: TableRowActionMethod<Data>): RowActionCheckFunction<Data> {
  const checkFunction = getMetadata<TableActionMethodOptions<Data>>(RXAP_TABLE_ACTION_METHOD_METADATA, method.constructor)?.checkFunction;
  if (!checkFunction) {
    throw new Error(`Extracted check function from '${method.constructor.name}' is empty`);
  }
  return checkFunction;
}

export function HasTableRowActionMetadata(method: TableRowActionMethod): boolean {
  return hasMetadata(
    RXAP_TABLE_ACTION_METHOD_METADATA,
    method.constructor
  )
}

export function GetTableRowActionMetadata(method: TableRowActionMethod): TableActionMethodOptions {
  const metadata = getMetadata<TableActionMethodOptions>(
    RXAP_TABLE_ACTION_METHOD_METADATA,
    method.constructor
  );
  if (!metadata) {
    throw new Error(`Extracted metadata from '${method.constructor.name}' is empty`);
  }
  return metadata;
}
