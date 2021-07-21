import { setMetadata } from '@rxap/utilities/reflect-metadata';

export const RXAP_TABLE_ACTION_METHOD_TYPE_METADATA = 'rxap-table-action-method-type-metadata';

export function TableActionMethod(type: string) {
  return function(target: any) {
    setMetadata(RXAP_TABLE_ACTION_METHOD_TYPE_METADATA, type, target);
  };
}
