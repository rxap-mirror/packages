import { RxapColumn } from '@rxap/table-system';
import { TableDefinitionMetaDataKeys } from './meta-data-keys';
import {
  addToMetadata,
  setMetadata
} from '@rxap/utilities';

export interface RxapColumnMetaData extends RxapColumn {
  propertyKey: string;
}

export function RxapTableColumn(column: Partial<RxapColumn>) {
  return function(target: any, propertyKey: string) {
    addToMetadata(
      TableDefinitionMetaDataKeys.COLUMN,
      propertyKey,
      target
    );
    setMetadata(TableDefinitionMetaDataKeys.COLUMN, <RxapColumnMetaData>{ propertyKey, id: propertyKey, ...column }, target, propertyKey);
  };
}
