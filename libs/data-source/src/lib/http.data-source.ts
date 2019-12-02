import {
  BaseDataSource,
  IBaseDataSourceViewer,
  RXAP_DATA_SOURCE_ID_TOKEN,
  RXAP_DATA_SOURCE_TRANSFORMERS_TOKEN,
  DataSourceTransformerFunction,
  DataSourceTransformerToken,
  IBaseDataSourceConnection
} from './base.data-source';
import {
  Injectable,
  Optional,
  Inject,
  InjectionToken
} from '@angular/core';
import { DataSourceId } from './collection-data-source';
import {
  HttpClient,
  HttpParams,
  HttpHeaders
} from '@angular/common/http';
import {
  Observable,
  Subject,
  Subscriber,
  BehaviorSubject,
  combineLatest,
  throwError,
  TeardownLogic
} from 'rxjs';
import {
  tap,
  switchMap,
  catchError,
  retry,
  takeUntil
} from 'rxjs/operators';

export interface IHttpDataSourceViewer extends IBaseDataSourceViewer {
  url?: string;
  params?: HttpParams;
  headers?: HttpHeaders;
}

export function HttpDataSourceConnectionSubscriptionHandler<Data>(this: HttpDataSourceConnection<Data>, subscriber: Subscriber<Data>): TeardownLogic {
  return combineLatest([
    this.params$,
    this.headers$
  ]).pipe(
    takeUntil(this.destroy$),
    switchMap(([ params, headers ]) => this.http.get<Data>(this.url, { params, headers }).pipe(
      tap(response => subscriber.next(response)),
      retry(3),
      catchError(error => {
        subscriber.error(error);
        throw throwError(error);
      })
    ))
  ).subscribe();
}

export class HttpDataSourceConnection<Data>
  extends Observable<Data>
  implements IBaseDataSourceConnection<Data> {

  public readonly params$!: BehaviorSubject<HttpParams | undefined>;
  public readonly headers$!: BehaviorSubject<HttpHeaders | undefined>;

  public readonly destroy$ = new Subject<void>();

  constructor(
    public readonly http: HttpClient,
    public readonly url: string = '',
    params?: HttpParams,
    headers?: HttpHeaders
  ) {
    // cast to any to allow type save access to the current
    // HttpDataSourceConnection instance
    super(HttpDataSourceConnectionSubscriptionHandler as any);
    this.params$  = new BehaviorSubject<HttpParams | undefined>(params);
    this.headers$ = new BehaviorSubject<HttpHeaders | undefined>(headers);
  }

  public unsubscribeAll(): void {
    this.destroy$.next();
  }

}

export const RXAP_DATA_SOURCE_HTTP_BASE_URL = new InjectionToken('rxap/data-source/http/base-url');

@Injectable()
export class HttpDataSource<Data, Source = Data, Viewer extends IHttpDataSourceViewer = IHttpDataSourceViewer>
  extends BaseDataSource<Data, Source, Viewer> {

  constructor(
    public http: HttpClient,
    @Optional() @Inject(RXAP_DATA_SOURCE_HTTP_BASE_URL) public readonly baseUrl: string,
    @Optional() @Inject(RXAP_DATA_SOURCE_ID_TOKEN) id: DataSourceId,
    @Optional() @Inject(RXAP_DATA_SOURCE_TRANSFORMERS_TOKEN) transformers: DataSourceTransformerFunction<Data, Source> | DataSourceTransformerToken<Data, Source>[] | null = null
  ) {
    super(id, null, transformers);
  }

  public connect(viewer: Viewer): HttpDataSourceConnection<Data> {
    const connection = new HttpDataSourceConnection<Data>(this.http, viewer.url, viewer.params, viewer.headers);

    this.registerConnection(viewer, connection);

    return connection;
  }

}
