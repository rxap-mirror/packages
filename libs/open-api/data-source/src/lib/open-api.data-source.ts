import {
  Injectable,
  Optional,
  Inject
} from '@angular/core';
import {
  OperationObjectWithMetadata,
  OpenApiConfigService,
  SchemaValidationMixin,
  RXAP_OPEN_API_STRICT_VALIDATOR,
  DEFAULT_OPEN_API_DATA_SOURCE_META_DATA
} from '@rxap/open-api';
import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse,
  HttpEventType
} from '@angular/common/http';
import {
  KeyValue,
  joinPath,
  isDefined,
  deepMerge
} from '@rxap/utilities';
import {
  HttpDataSourceMetadata,
  HttpDataSourceOptions,
  BaseHttpDataSource
} from '@rxap/data-source/http';
import {
  RXAP_DATA_SOURCE_METADATA,
  RxapDataSource,
  BaseDataSourceViewer,
  RXAP_DATA_SOURCE_REFRESH
} from '@rxap/data-source';
import {
  Observable,
  throwError,
  Subject,
  EMPTY
} from 'rxjs';
import {
  map,
  tap,
  retry,
  filter,
  catchError,
  timeout,
  take
} from 'rxjs/operators';
import { Mixin } from '@rxap/mixin';

export interface OpenApiDataSourceMetadata<PathParams = KeyValue, Body = any | null> extends Partial<HttpDataSourceMetadata<PathParams, Body>> {

  /**
   * The operation object with path and method
   */
  operation?: OperationObjectWithMetadata;

  /**
   * The index of the server object in the servers array in the open api config
   */
  serverIndex?: number;

  /**
   * The operation id
   */
  id: string;

  strict?: boolean;

}

export interface OpenApiDataSourceViewer<Parameters extends Record<string, any> = any>
  extends BaseDataSourceViewer<Parameters> {
  parameters?: Parameters;
}

export function RxapOpenApiDataSource(operationIdOrMetadata: string | OpenApiDataSourceMetadata, serverIndex: number = 0) {
  const metadata = typeof operationIdOrMetadata === 'string' ? { id: operationIdOrMetadata, serverIndex } : operationIdOrMetadata;
  return function(target: any) {
    RxapDataSource(metadata)(target);
  };
}

export interface OpenApiDataSource<Response = any, Parameters extends Record<string, any> = any> extends SchemaValidationMixin<Response, Parameters> {}

@Mixin(SchemaValidationMixin)
@Injectable()
export class OpenApiDataSource<Response = any, Parameters extends Record<string, any> = any>
  extends BaseHttpDataSource<Response> {

  public get operation(): OperationObjectWithMetadata {
    return this.metadata.operation;
  }

  private readonly strict: boolean = false;

  constructor(
    @Inject(HttpClient)
      http: HttpClient,
    @Inject(OpenApiConfigService)
    private readonly openApiConfigService: OpenApiConfigService,
    @Optional()
    @Inject(DEFAULT_OPEN_API_DATA_SOURCE_META_DATA)
      metadata: OpenApiDataSourceMetadata | null = null,
    @Optional()
    @Inject(RXAP_DATA_SOURCE_REFRESH)
      refresh$: Subject<HttpDataSourceOptions> | null = null,
    @Optional()
    @Inject(RXAP_OPEN_API_STRICT_VALIDATOR)
    strict: boolean | null = null,
  ) {
    super(http, metadata as any);
    let operation: OperationObjectWithMetadata;
    if (!this.metadata.operation) {
      this.metadata.operation = operation = openApiConfigService.getOperation(this.metadata.id);
    } else {
      operation = this.metadata.operation;
    }

    if (operation.method !== 'GET') {
      throw new Error('OpenApi DataSource only supports GET Operations!');
    }

    this.applyMetadata({
      id:     operation.operationId,
      url:    () => joinPath(openApiConfigService.getBaseUrl(this.metadata.serverIndex), operation.path),
      method: 'GET'
    });

    this.strict = strict || this.metadata.strict || false;

  }

  public derive<D = Response>(
    id: string,
    metadata: Partial<OpenApiDataSourceMetadata> = this.metadata,
    isolated: boolean                                           = false
  ): OpenApiDataSource<D, Parameters> {
    return new OpenApiDataSource<D, Parameters>(
      this.http,
      this.openApiConfigService,
      { ...deepMerge(this.metadata, metadata), id },
      isolated ? null : this.refresh$
    );
  }

  public connect(viewer: OpenApiDataSourceViewer<Parameters>): Observable<Response> {


    if (viewer.parameters) {
      this.validateParameters(this.operation, viewer.parameters, this.strict);
    } else {
      if (viewer.viewChange === EMPTY || viewer.viewChange === undefined) {
        // set the viewer parameters to an empty parameter and test if that
        // is valid.
        viewer.parameters = {} as any;
        this.validateParameters(this.operation, viewer.parameters, this.strict);
      }
    }

    return super.connect({
      ...viewer,
      ...this.buildHttpOptions(this.operation, viewer.parameters),
      // if the view change is an empty observable. Then dont apply the pipe logic
      // else the http request is never triggered
      viewChange: viewer.viewChange === EMPTY ? viewer.viewChange : viewer.viewChange?.pipe(
        tap(parameters => this.validateParameters(this.operation, parameters, this.strict)),
        map(parameters => this.buildHttpOptions(this.operation, parameters))
      )
    });

  }

  protected buildRequest(options: HttpDataSourceOptions): Observable<Response> {
    return this.http.request<Response>(this.buildHttpRequest(options)).pipe(
      retry(this.metadata.retry ?? 0),
      catchError((response: HttpErrorResponse) => {
        this.interceptors.forEach(interceptor => interceptor
          .next({ response, options })
        );
        return throwError(response);
      }),
      filter((event: any) => event.type === HttpEventType.Response),
      tap((response: HttpResponse<Response>) => this.validateResponse(this.operation, response, this.strict)),
      tap((response: HttpResponse<Response>) => {
        this.interceptors.forEach(interceptor => interceptor
          .next({ response, options })
        );
      }),
      map((event: HttpResponse<Response>) => event.body),
      isDefined(),
      take(1),
      timeout(this.timeout)
    );
  }

}
