import { TableDefinitionMetaDataKeys } from './meta-data-keys';
import { setMetadata } from '@rxap/utilities';

export interface TableDefinitionMetaData {
  tableId: string
}

export function RxapTable(tableId: string) {
  return function(target: any) {
    setMetadata(TableDefinitionMetaDataKeys.TABLE_DEFINITION, { tableId }, target);
  };
}
