import {
  getMetadata,
  hasMetadata
} from '@rxap/utilities/reflect-metadata';
import { Method } from '@rxap/utilities/rxjs';
import { RXAP_TABLE_ACTION_METHOD_TYPE_METADATA } from './decorators';

export type TableRowActionTypeSwitchMethod<Data extends Record<string, any>> = Method<any, { element: Data; type: string }>;
export type TableRowActionTypeMethod<Data extends Record<string, any>> = Method<any,
  Data>;

export type TableRowActionMethod<Data extends Record<string, any>> =
  | TableRowActionTypeSwitchMethod<Data>
  | TableRowActionTypeMethod<Data>;

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
