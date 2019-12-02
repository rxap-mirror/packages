import {
  Type,
  getMetadata
} from '@rxap/utilities';
import { Injectable } from '@angular/core';
import { BaseDataSource } from './base.data-source';
import { DataSourceMetaDataKeys } from './decorators/meta-data-keys';
import { DataSourceMetaData } from './decorators/data-source';

export function getDataSourceId(dataSourceType: Type<BaseDataSource<any>>) {
  const dataSourceMetaData: DataSourceMetaData | null = getMetadata<DataSourceMetaData>(
    DataSourceMetaDataKeys.DATA_SOURCE,
    dataSourceType
  );
  if (!dataSourceMetaData) {
    throw new Error('DataSource Constructor has not a meta data definition');
  }
  if (!dataSourceMetaData.dataSourceId) {
    throw new Error('DataSource meta data has not a tableId');
  }
  return dataSourceMetaData.dataSourceId;
}

@Injectable({ providedIn: 'root' })
export class DataSourceRegistry {

  public dataSources = new Map<string, Type<BaseDataSource<any>>>();

  public register(dataSourceType: Type<BaseDataSource<any>>, dataSourceId: string = getDataSourceId(dataSourceType)) {
    if (!dataSourceId) {
      throw new Error('Can not register a data source without an dataSourceId');
    }
    this.dataSources.set(dataSourceId, dataSourceType);
  }

  public has(tableId: string): boolean {
    return this.dataSources.has(tableId);
  }

  public get<T extends BaseDataSource<any>>(dataSourceId: string): Type<T> {
    if (!this.has(dataSourceId)) {
      throw new Error(`Data Source with data source id '${dataSourceId}' is not registered`);
    }
    return this.dataSources.get(dataSourceId) as any;
  }

}
