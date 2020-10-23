import {
  HttpSentEvent,
  HttpResponse,
  HttpProgressEvent,
  HttpHeaderResponse,
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import {
  hasIndexSignature,
  deepMerge,
  joinPath,
  RequestInProgressSubject,
  Constructor
} from '@rxap/utilities';
import {
  Subject,
  ReplaySubject,
  Observable,
  Subscription,
  EMPTY,
  of,
  throwError
} from 'rxjs';
import {
  switchMap,
  tap,
  retry,
  filter,
  map,
  finalize,
  skip,
  catchError,
  first,
  timeout,
  take
} from 'rxjs/operators';
import {
  Inject,
  Optional,
  Injectable
} from '@angular/core';
import { HttpDataSourceOptions } from './http.data-source.options';
import {
  BaseDataSource,
  RXAP_DATA_SOURCE_REFRESH,
  RxapDataSourceError,
  RXAP_DATA_SOURCE_METADATA,
  RxapDataSource
} from '@rxap/data-source';
import { HttpDataSourceMetadata } from './http.data-source.metadata';
import { HttpDataSourceViewer } from './http.data-source.viewer';
import { RxapHttpDataSourceError } from './error';
import { BaseHttpDataSource } from './base-http.data-source';

@Injectable()
export class HttpDataSource<Data = any, PathParams = any, Body = any> extends BaseHttpDataSource<Data, PathParams, Body> {

  public readonly onSentEvent$                                               = new Subject<HttpSentEvent>();
  public readonly onResponse$                                                = new Subject<HttpResponse<Data>>();
  public readonly onDownloadProgress$                                        = new Subject<HttpProgressEvent>();
  public readonly onUploadProgress$                                          = new Subject<HttpProgressEvent>();
  public readonly onResponseHeader$                                          = new Subject<HttpHeaderResponse>();

  public derive<D = Data>(
    id: string,
    metadata: Partial<HttpDataSourceMetadata<PathParams, Body>> = this.metadata,
    isolated: boolean                                           = false
  ): HttpDataSource<D, PathParams, Body> {
    return new HttpDataSource<D, PathParams, Body>(
      this.http,
      { ...deepMerge(this.metadata, metadata), id },
      isolated ? null : this.refresh$
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
        this.interceptors.forEach(interceptor => interceptor
          .next({ response, options })
        );
      }),
      catchError((response: HttpErrorResponse) => {
        this.interceptors.forEach(interceptor => interceptor
          .next({ response, options })
        );
        return throwError(response);
      }),
      map((event: HttpResponse<Data>) => event.body),
      map(data => this.transform(data)),
      take(1),
      timeout(this.timeout)
    );
  }

}

export function RxapHttpDataSource<Data, PathParams = any, Body = any>(
  metadata: HttpDataSourceMetadata<PathParams, Body>,
  className: string   = 'HttpDataSource',
  packageName: string = '@rxap/data-source/http'
) {
  return function(target: Constructor<HttpDataSource<Data, PathParams, Body>>) {
    RxapDataSource(metadata, className, packageName)(target);
  };
}
