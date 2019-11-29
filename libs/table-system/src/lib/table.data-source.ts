import {
  Sort,
  Filter,
  BaseDataSource,
  IBaseDataSourceViewer,
  IBaseDataSourceConnection
} from '@rxap/data-source';
import { Observable } from 'rxjs';

export interface TableDataSourceConnection<Data> extends Observable<Data>, IBaseDataSourceConnection<Data> {
  refresh(params: { sort: Sort, filters: Filter[], page: number, pageSize: number }): void;
}

export interface TableDataSource<Data, Source = Data> extends BaseDataSource<Data, Source> {

  connect(viewer: IBaseDataSourceViewer): TableDataSourceConnection<Data>;

}
