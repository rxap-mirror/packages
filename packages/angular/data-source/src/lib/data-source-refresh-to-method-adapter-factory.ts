import { ToMethod } from '@rxap/pattern';
import { BaseDataSource } from './base.data-source';

export function DataSourceRefreshToMethodAdapterFactory(dataSource: BaseDataSource<unknown>) {
  return ToMethod(() => dataSource.refresh());
}
