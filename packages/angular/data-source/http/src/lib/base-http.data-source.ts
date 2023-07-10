import {
  BaseDataSource,
  RXAP_DATA_SOURCE_METADATA,
  RXAP_DATA_SOURCE_REFRESH,
  RxapDataSourceError,
} from '@rxap/data-source';
import {EMPTY, firstValueFrom, Observable, of, ReplaySubject, Subject, Subscription} from 'rxjs';
import {HttpClient, HttpRequest} from '@angular/common/http';
import {deepMerge, hasIndexSignature, joinPath} from '@rxap/utilities';
import {Inject, Injectable, Optional} from '@angular/core';
import {finalize, skip, switchMap, tap} from 'rxjs/operators';
import {HttpDataSourceMetadata} from './http.data-source.metadata';
import {HttpDataSourceViewer} from './http.data-source.viewer';
import {HttpDataSourceOptions} from './http.data-source.options';
import {RxapHttpDataSourceError} from './error';
import {RequestInProgressSubject} from '@rxap/rxjs';

@Injectable()
export abstract class BaseHttpDataSource<Data = any, PathParams = any, Body = any> extends BaseDataSource<
  Data,
  HttpDataSourceMetadata<PathParams, Body>,
  HttpDataSourceViewer<PathParams, Body>> {

  public readonly requestsInProgress$ = new RequestInProgressSubject();
  public readonly refresh$: Subject<HttpDataSourceOptions<PathParams, Body>> = new Subject<HttpDataSourceOptions<PathParams, Body>>();
  public readonly refreshed$ = new Subject<void>();

  public timeout = 60 * 1000;

  protected _options!: HttpDataSourceOptions<PathParams, Body>;

  protected _refreshSubscription: Subscription | null = null;
  protected override _data$!: ReplaySubject<Data>;

  constructor(
    @Inject(HttpClient)
    public readonly http: HttpClient,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_METADATA)
      metadata: HttpDataSourceMetadata<PathParams, Body> | null = null,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_REFRESH)
      refresh$: Subject<HttpDataSourceOptions<PathParams, Body>> | null = null,
  ) {
    super(metadata);
    this.timeout = this.metadata.timeout ?? this.timeout;
    this.loading$ = this.requestsInProgress$.loading$();
    if (http === undefined) {
      throw new RxapDataSourceError('HttpClient is undefined. Ensure that the HttpClient is added to the deps property!', '', this.constructor.name);
    }
    if (refresh$) {
      this.refresh$ = refresh$;
    }
  }

  public abstract override derive(id: string, metadata: Partial<HttpDataSourceMetadata<PathParams, Body>>): BaseHttpDataSource<Data>;

  public request$(options: HttpDataSourceOptions<PathParams, Body> = this._options, merge = false): Promise<Data> {
    this.init();
    if (merge) {
      // TODO : add deep merge
      options = {...this._options, ...options};
    }
    // test if options is defined. Can be undefined if the init method is not yet been called
    if (!options) {
      options = this._options;
    }
    return firstValueFrom(this.buildRequest(options));
  }

  public override reset(): any {
    this._data = undefined;
    if (this._refreshSubscription) {
      this._refreshSubscription.unsubscribe();
    }
    super.reset();
    this._initialised = false;
    this.init();
  }

  public override refresh(
    options: HttpDataSourceOptions<PathParams, Body> = this._options,
    merge = false,
    force = false,
  ) {
    this.init();
    if (force || this._connectedViewer.size !== 0) {
      if (merge) {
        // TODO : add deep merge
        options = {...this._options, ...options};
      }
      // test if options is defined. Can be undefined if the init method is not yet been called
      if (!options) {
        options = this._options;
      }
      this.refresh$.next(options);
      this.refreshed$.next();
    }
  }

  public override init(): void {
    if (this._initialised) {
      return;
    }
    super.init();

    if (this._refreshSubscription) {
      throw new RxapHttpDataSourceError('The refresh subscription is already initialised', '');
    }

    this._options = {
      params: this.metadata.params,
      pathParams: this.metadata.pathParams,
      body: this.metadata.body,
      headers: this.metadata.headers,
    };

    this._data$ = new ReplaySubject<Data>(this.metadata.bufferSize ?? 1);

    this._refreshSubscription = this.refresh$.pipe(
      tap(options => this._options = options),
      tap(() => this.requestsInProgress$.increase()),
      switchMap(options => this.buildRequest(options).pipe(
        finalize(() => this.requestsInProgress$.decrease()),
      )),
    ).subscribe(this._data$);

  }

  protected isEqualToLastOptions(options: HttpDataSourceOptions<PathParams, Body>): boolean {
    const keys: Array<keyof HttpDataSourceOptions<PathParams, Body>> = [
      'url',
      'pathParams',
      'body',
      'params',
      'headers',
    ];
    return !!this._options && keys.every(key => this._options[key] === options[key]);
  }

  protected override _connect(viewer: HttpDataSourceViewer<PathParams, Body>): [Observable<Data>, Subscription] {
    this.init();

    if (viewer.url === this.metadata.url) {
      delete viewer.url;
    }

    if (viewer.viewChange === EMPTY && (!viewer.lazy || this._data === undefined || !this.isEqualToLastOptions(viewer))) {
      viewer.realtime = this._data !== undefined;
      viewer.viewChange = of(viewer);
    }

    return [
      viewer.realtime ? this._data$.pipe(skip(this.metadata.bufferSize ?? 1)) : this._data$,
      viewer.viewChange!.pipe(
        tap(options => this.refresh(options, true, true)),
      ).subscribe(),
    ];
  }

  protected getRequestUrl(): string {
    if (typeof this.metadata.url === 'function') {
      return this.metadata.url();
    }
    return this.metadata.url;
  }

  protected buildHttpRequest(options: HttpDataSourceOptions<PathParams, Body>): HttpRequest<Body> {
    return new HttpRequest(
      this.metadata.method ?? 'GET',
      this.buildUrlWithParams(
        joinPath(this.getRequestUrl(), options.url ?? null),
        deepMerge(this.metadata.pathParams ?? {}, options.pathParams ?? {}),
      ),
      options.body ?? this.metadata.body ?? null,
      {
        params: options.params ?? this.metadata.params,
        headers: options.headers ?? this.metadata.headers,
        reportProgress: true,
        responseType: this.metadata.responseType ?? 'json',
        withCredentials: this.metadata.withCredentials,
      },
    );
  }

  protected buildUrlWithParams(url: string, pathParams: Record<string, string>): string {
    const matches = url.match(/\{[^}]+\}/g);

    if (matches) {

      if (!hasIndexSignature(pathParams)) {
        throw new RxapDataSourceError(`Path params for connection '${this.id}' has not an index signature`, '', this.constructor.name);
      }

      for (const match of matches) {
        const param = match.substr(1, match.length - 2);
        let replace: string | null = null;
        // eslint-disable-next-line no-prototype-builtins
        if (pathParams.hasOwnProperty(param)) {
          replace = encodeURIComponent(pathParams[param]);
        }
        if (replace === null) {
          throw new RxapDataSourceError(`Path params for connection '${this.id}' has not a defined value for '${param}'`, '', this.constructor.name);
        }
        url = url.replace(match, replace);
      }
    }

    return url;
  }

  protected abstract buildRequest(options: HttpDataSourceOptions<PathParams, Body>): Observable<Data>;

}
