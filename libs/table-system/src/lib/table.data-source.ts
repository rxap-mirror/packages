import {
  Sort,
  BaseDataSource,
  IBaseDataSourceViewer,
  IBaseDataSourceConnection
} from '@rxap/data-source';
import { Observable } from 'rxjs';
import { KeyValue } from '@rxap/utilities';

export interface RefreshParams {
  sort: Sort | null;
  filters: KeyValue | null;
  page: number;
  pageSize: number;
}

export interface TableDataSourceConnection<Data> extends Observable<Data>, IBaseDataSourceConnection<Data> {
  refresh(params?: RefreshParams): void;
}

export interface TableDataSource<Data, Source = Data> extends BaseDataSource<Data, Source> {

  connect(viewer: IBaseDataSourceViewer): TableDataSourceConnection<Data>;

}
