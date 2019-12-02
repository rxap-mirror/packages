import {
  HttpDataSourceConnection,
  Sort,
  HttpDataSource,
  IHttpDataSourceViewer,
  HttpDataSourceResponseWrapper
} from '@rxap/data-source';
import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import {
  TableDataSource,
  TableDataSourceConnection,
  RefreshParams
} from './table.data-source';
import { first } from 'rxjs/operators';
import { KeyValue } from '@rxap/utilities';

function mergeHttpParams(...httpParams: HttpParams[]) {
  let param = new HttpParams();
  for (const httpParam of httpParams.filter(p => p.keys().length !== 0)) {
    for (const key of httpParam.keys()) {
      param = param.append(key, httpParam.get(key)!);
    }
  }
  return param;
}

export interface HttpDataSourceResponseWrapper<Data> {
  data: Data;
}

export class HttpTableDataSourceConnection<Data>
  extends HttpDataSourceConnection<HttpDataSourceResponseWrapper<Data>>
  implements TableDataSourceConnection<HttpDataSourceResponseWrapper<Data>> {

  protected lastParams: RefreshParams = { sort: null, filters: null, page: 0, pageSize: 10 };

  public refresh(params: RefreshParams = this.lastParams, force: boolean = false): void {
    this.lastParams = params;
    this.params$.next(this.buildParams(params));
  }

  private buildParams(params: RefreshParams): HttpParams {
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

  private getFilterParam(filters: KeyValue): HttpParams {
    const param = new HttpParams();
    if (filters) {
      return param.append(
        'filter',
        Object.entries(filters).filter(([ _, value ]) => value !== '').map(([ key, value ]) => `${key}:${value}`).join(';')
      );
    }
    return param.append('filter', '');
  }

  private getSortParam(sort: Sort): HttpParams {
    return new HttpParams()
      .append('sort', sort.key)
      .append('order', sort.direction + '');
  }

  public toPromise(): Promise<HttpDataSourceResponseWrapper<Data>> {
    return this.pipe(first()).toPromise();
  }

}

@Injectable()
export class HttpTableDataSource<Data, Source = Data>
  extends HttpDataSource<HttpDataSourceResponseWrapper<Data>, HttpDataSourceResponseWrapper<Data>>
  implements TableDataSource<HttpDataSourceResponseWrapper<Data>, HttpDataSourceResponseWrapper<Data>> {

  public connect(viewer: IHttpDataSourceViewer): HttpTableDataSourceConnection<Data> {
    const connection = new HttpTableDataSourceConnection<Data>(
      this.http,
      [ this.baseUrl, viewer.url ].filter(Boolean).join('/'),
      viewer.params,
      viewer.headers
    );
    this.registerConnection(viewer, connection);
    return connection;
  }

}
