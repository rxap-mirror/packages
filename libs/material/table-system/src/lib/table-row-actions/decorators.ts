import { setMetadata } from '@rxap/utilities/reflect-metadata';
import { RowActionCheckFunction } from './types';

export const RXAP_TABLE_ACTION_METHOD_TYPE_METADATA = 'rxap-table-action-method-type-metadata';
export const RXAP_TABLE_ACTION_METHOD_CHECK_FUNCTION_METADATA = 'rxap-table-action-method-check-function-metadata';

export function TableActionMethod<Data = unknown>(type: string, checkFunction?: RowActionCheckFunction<Data>) {
  return function(target: any) {
    setMetadata(RXAP_TABLE_ACTION_METHOD_TYPE_METADATA, type, target);
    if (checkFunction) {
      setMetadata(RXAP_TABLE_ACTION_METHOD_CHECK_FUNCTION_METADATA, checkFunction, target);
    }
  };
}
