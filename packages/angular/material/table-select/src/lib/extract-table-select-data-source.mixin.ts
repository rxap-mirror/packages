import { BaseDataSource } from '@rxap/data-source';
import { ExtractDatasourceMixin } from '@rxap/material-table-window-system';
import { Mixin } from '@rxap/mixin';
import { TABLE_SELECT_DATA_SOURCE } from './derectives';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ExtractTableSelectDataSourceMixin<Data extends Record<string, any>> extends ExtractDatasourceMixin {
}

@Mixin(ExtractDatasourceMixin)
export class ExtractTableSelectDataSourceMixin<Data extends Record<string, any>> {

  protected extractTableSelectDataSource(): BaseDataSource<Data[]> {
    return this.extractDatasource(TABLE_SELECT_DATA_SOURCE) as any as BaseDataSource<Data[]>;
  }

}
