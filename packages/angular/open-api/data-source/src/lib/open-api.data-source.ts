import {
  Inject,
  Injectable,
  Optional,
} from '@angular/core';
import {
  DEFAULT_OPEN_API_DATA_SOURCE_META_DATA,
  DISABLE_SCHEMA_VALIDATION,
  DISABLE_VALIDATION,
  OpenApiConfigService,
  OperationObjectWithMetadata,
  RXAP_OPEN_API_STRICT_VALIDATOR,
  SchemaValidationMixin,
} from '@rxap/open-api';
import {
  HttpClient,
  HttpErrorResponse,
  HttpEventType,
  HttpResponse,
} from '@angular/common/http';
import {
  deepMerge,
  KeyValue,
} from '@rxap/utilities';
import {
  BaseHttpDataSource,
  HttpDataSourceMetadata,
  HttpDataSourceOptions,
  HttpDataSourceViewer,
} from '@rxap/data-source/http';
import {
  RXAP_DATA_SOURCE_REFRESH,
  RxapDataSource,
} from '@rxap/data-source';
import {
  EMPTY,
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
import { Mixin } from '@rxap/mixin';
import { isDefined } from '@rxap/rxjs';

export interface OpenApiDataSourceMetadata<PathParams = KeyValue, Body = any | null>
  extends Partial<HttpDataSourceMetadata<PathParams, Body>> {

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

export interface OpenApiDataSourceViewer<Parameters = any>
  extends HttpDataSourceViewer<any, any> {
  parameters?: Parameters;
}

export function RxapOpenApiDataSource(operationIdOrMetadata: string | OpenApiDataSourceMetadata, serverIndex = 0) {
  const metadata = typeof operationIdOrMetadata === 'string' ?
    {
      id: operationIdOrMetadata,
      serverIndex,
    } :
    operationIdOrMetadata;
  return function (target: any) {
    RxapDataSource(metadata)(target);
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OpenApiDataSource<Response = any, Parameters extends Record<string, any> | void = any>
  extends SchemaValidationMixin<Response, Parameters> {}

@Mixin(SchemaValidationMixin)
@Injectable()
export class OpenApiDataSource<Response = any, Parameters extends Record<string, any> | void = any>
  extends BaseHttpDataSource<Response> {

  protected readonly strict: boolean = false;
  protected readonly disableSchemaValidation: boolean = false;
  protected readonly disableValidation: boolean = false;

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
    @Optional()
    @Inject(DISABLE_SCHEMA_VALIDATION)
      disableSchemaValidation: boolean | null = null,
    @Optional()
    @Inject(DISABLE_VALIDATION)
      disableValidation: boolean | null = null,
  ) {
    super(http, metadata as any);
    let operation: OperationObjectWithMetadata;
    if (!this.metadata['operation']) {
      this.metadata['operation'] = operation = openApiConfigService.getOperation(this.metadata.id);
    } else {
      operation = this.metadata['operation'];
    }

    if (operation.method !== 'GET') {
      throw new Error('OpenApi DataSource only supports GET Operations!');
    }

    this.applyMetadata({
      id: operation.operationId,
      url: () => openApiConfigService.getBaseUrl(this.metadata['serverIndex']) + operation.path,
      method: 'GET',
    });

    this.strict = strict || this.metadata['strict'] || false;
    this.disableSchemaValidation = disableSchemaValidation || this.metadata['disableSchemaValidation'] || false;
    this.disableValidation = disableValidation || this.metadata['disableValidation'] || false;

  }

  public get operation(): OperationObjectWithMetadata {
    return this.metadata['operation'];
  }

  public override derive<D = Response>(
    id: string,
    metadata: Partial<OpenApiDataSourceMetadata> = this.metadata,
    isolated = false,
  ): OpenApiDataSource<D, Parameters> {
    return new OpenApiDataSource<D, Parameters>(
      this.http,
      this.openApiConfigService,
      {
        ...deepMerge(this.metadata, metadata),
        id,
      },
      isolated ? null : this.refresh$,
    );
  }

  public override connect(viewer: OpenApiDataSourceViewer<Parameters>): Observable<Response> {


    if (viewer.parameters) {
      if (!this.disableValidation) {
        this.validateParameters(this.operation, viewer.parameters as any, this.strict);
      }
    } else {
      if (viewer.viewChange === EMPTY || viewer.viewChange === undefined) {
        // set the viewer parameters to an empty parameter and test if that
        // is valid.
        viewer.parameters = {} as any;
        if (!this.disableValidation) {
          this.validateParameters(this.operation, viewer.parameters as any, this.strict);
        }
      }
    }

    return super.connect({
      ...viewer,
      ...this.buildHttpOptions(this.operation, viewer.parameters),
      // if the view change is an empty observable. Then dont apply the pipe logic
      // else the http request is never triggered
      viewChange: viewer.viewChange === EMPTY ? viewer.viewChange : viewer.viewChange?.pipe(
        tap(parameters => {
          if (!this.disableValidation) {
            this.validateParameters(this.operation, parameters as any, this.strict);
          }
        }),
        map(parameters => this.buildHttpOptions(this.operation, parameters as any)),
      ),
    });

  }

  protected override buildRequest(options: HttpDataSourceOptions): Observable<Response> {
    return this.http.request<Response>(this.buildHttpRequest(options)).pipe(
      retry(this.metadata.retry ?? 0),
      catchError((response: HttpErrorResponse) => {
        this.interceptors?.forEach(interceptor => interceptor
          .next({
            response,
            options,
          }),
        );
        return throwError(response);
      }),
      filter((event: any) => event.type === HttpEventType.Response),
      tap((response: HttpResponse<Response>) => {
        if (!this.disableValidation) {
          this.validateResponse(this.operation, response, this.strict);
        }
      }),
      tap((response: HttpResponse<Response>) => {
        this.interceptors?.forEach(interceptor => interceptor
          .next({
            response,
            options,
          }),
        );
      }),
      map((event: HttpResponse<Response>) => event.body),
      isDefined(),
      take(1),
      timeout(this.timeout),
    );
  }

}
