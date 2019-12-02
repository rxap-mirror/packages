import { DataSourceMetaDataKeys } from './meta-data-keys';
import { setMetadata } from '@rxap/utilities';

export interface DataSourceMetaData {
  dataSourceId: string
}

export function RxapDataSource(dataSourceId: string) {
  return function(target: any) {
    setMetadata(DataSourceMetaDataKeys.DATA_SOURCE, { dataSourceId }, target);
  };
}
