import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHeaderResponse,
  HttpProgressEvent,
  HttpResponse,
  HttpSentEvent,
} from '@angular/common/http';
import {
  Constructor,
  deepMerge,
} from '@rxap/utilities';
import {
  Observable,
  Subject,
  throwError,
} from 'rxjs';
import {
  catchError,
  filter,
  map,
  retry,
  take,
  tap,
  timeout,
} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpDataSourceOptions } from './http.data-source.options';
import { RxapDataSource } from '@rxap/data-source';
import { HttpDataSourceMetadata } from './http.data-source.metadata';
import { BaseHttpDataSource } from './base-http.data-source';

@Injectable()
export class HttpDataSource<Data = any, PathParams = any, Body = any>
  extends BaseHttpDataSource<Data, PathParams, Body> {

  public readonly onSentEvent$ = new Subject<HttpSentEvent>();
  public readonly onResponse$ = new Subject<HttpResponse<Data>>();
  public readonly onDownloadProgress$ = new Subject<HttpProgressEvent>();
  public readonly onUploadProgress$ = new Subject<HttpProgressEvent>();
  public readonly onResponseHeader$ = new Subject<HttpHeaderResponse>();

  public derive<D = Data>(
    id: string,
    metadata: Partial<HttpDataSourceMetadata<PathParams, Body>> = this.metadata,
    isolated = false,
  ): HttpDataSource<D, PathParams, Body> {
    return new HttpDataSource<D, PathParams, Body>(
      this.http,
      {
        ...deepMerge(this.metadata, metadata),
        id,
      },
      isolated ? null : this.refresh$,
    );
  }

  public transform(data: any): Data {
    return data;
  }

  protected handelHttpEvent(event: HttpEvent<Data>) {
    switch (event.type) {

      case HttpEventType.Sent:
        this.onSentEvent$.next(event);
        break;

      case HttpEventType.Response:
        this.onResponse$.next(event);
        break;

      case HttpEventType.DownloadProgress:
        this.onDownloadProgress$.next(event);
        break;

      case HttpEventType.UploadProgress:
        this.onUploadProgress$.next(event);
        break;

      case HttpEventType.ResponseHeader:
        this.onResponseHeader$.next(event);
        break;

    }
  }

  protected buildRequest(options: HttpDataSourceOptions<PathParams, Body>): Observable<Data> {
    return this.http.request<Data>(this.buildHttpRequest(options)).pipe(
      retry(this.metadata.retry ?? 0),
      tap(event => this.handelHttpEvent(event)),
      filter((event: any) => event instanceof HttpResponse),
      tap((response: HttpResponse<Data>) => {
        this.interceptors?.forEach(interceptor => interceptor
          .next({
            response,
            options,
          }),
        );
      }),
      catchError((response: HttpErrorResponse) => {
        this.interceptors?.forEach(interceptor => interceptor
          .next({
            response,
            options,
          }),
        );
        return throwError(response);
      }),
      map((event: HttpResponse<Data>) => event.body),
      map(data => this.transform(data)),
      take(1),
      timeout(this.timeout),
    );
  }

}

export function RxapHttpDataSource<Data, PathParams = any, Body = any>(
  metadata: HttpDataSourceMetadata<PathParams, Body>,
  className = 'HttpDataSource',
  packageName = '@rxap/data-source/http',
) {
  return function (target: Constructor<HttpDataSource<Data, PathParams, Body>>) {
    RxapDataSource(metadata, className, packageName)(target);
  };
}
