import {
  HttpDataSourceConnection,
  Sort,
  Filter,
  HttpDataSource,
  IHttpDataSourceViewer
} from '@rxap/data-source';
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import {
  TableDataSource,
  TableDataSourceConnection
} from './table.data-source';
import { first } from 'rxjs/operators';

function mergeHttpParams(...httpParams: HttpParams[]) {
  const param = new HttpParams();
  for (const httpParam of httpParams.filter(p => p.keys().length !== 0)) {
    for (const key of httpParam.keys()) {
      param.append(key, httpParam.get(key)!);
    }
  }
  return param;
}

export class HttpTableDataSourceConnection<Data> extends HttpDataSourceConnection<Data> implements TableDataSourceConnection<Data> {

  public refresh(params: { sort: Sort, filters: Filter[], page: number, pageSize: number }): void {
    this.params$.next(this.buildParams(params));
  }

  private buildParams(params: { sort?: Sort, filters?: Filter[], page: number, pageSize: number }): HttpParams {
    const pageParams = this.getPagingParam(params.page, params.pageSize);
    let sortParams   = new HttpParams();
    if (params.sort) {
      sortParams = this.getSortParam(params.sort);
    }
    let filterParams = new HttpParams();
    if (params.filters) {
      filterParams = this.getFilterParam(params.filters);
    }
    return mergeHttpParams(pageParams, sortParams, filterParams);
  }

  private getPagingParam(page: number, pageSize: number): HttpParams {
    return new HttpParams()
      .append('page', page.toFixed(0))
      .append('size', pageSize.toFixed(0));
  }

  private getFilterParam(filters: Filter[]): HttpParams {
    const param = new HttpParams();
    if (filters.length) {
      return param.append(
        'filter',
        filters.map(filterChange => `${filterChange.key}:${filterChange.value}`).join(';')
      );
    }
    return param.append('filter', '');
  }

  private getSortParam(sort: Sort): HttpParams {
    return new HttpParams()
      .append('sort', sort.key)
      .append('order', sort.direction + '');
  }

  public toPromise(): Promise<Data> {
    return new Promise<Data>(((resolve, reject) => this.pipe(first()).subscribe(resolve, reject)));
  }

}

@Injectable()
export class HttpTableDataSource<Data, Source = Data> extends HttpDataSource<Data[], Source[]> implements TableDataSource<Data[], Source[]> {

  public connect(viewer: IHttpDataSourceViewer): HttpTableDataSourceConnection<Data[]> {
    const connection = new HttpTableDataSourceConnection<Data[]>(
      this.http,
      [ this.baseUrl, viewer.url ].filter(Boolean).join('/'),
      viewer.params,
      viewer.headers
    );
    this.registerConnection(viewer, connection);
    return connection;
  }

}
