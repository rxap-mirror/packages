import {
  Inject,
  Injector,
  Optional,
  Injectable
} from '@angular/core';
import {
  HttpClient,
  HttpResponse,
  HttpEventType,
  HttpErrorResponse
} from '@angular/common/http';
import {
  OperationObjectWithMetadata,
  OpenApiConfigService,
  SchemaValidationMixin,
  RXAP_OPEN_API_STRICT_VALIDATOR,
  DEFAULT_OPEN_API_REMOTE_METHOD_META_DATA
} from '@rxap/open-api';
import { BaseHttpRemoteMethod } from '@rxap/remote-method/http';
import {
  BaseRemoteMethodMetadata,
  RxapRemoteMethod
} from '@rxap/remote-method';
import { joinPath } from '@rxap/utilities';
import {
  filter,
  timeout,
  retry,
  catchError,
  tap,
  take
} from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Mixin } from '@rxap/mixin';

export function RxapOpenApiRemoteMethod(operationId: string, serverIndex: number = 0) {
  return function(target: any) {
    RxapRemoteMethod({ id: operationId, serverIndex })(target);
  };
}

export interface OpenApiRemoteMethodMetadata extends BaseRemoteMethodMetadata {
  /**
   * The operation object with path and method
   */
  operation?: OperationObjectWithMetadata;
  /**
   * The index of the server object in the servers array in the open api config
   */
  serverIndex?: number;
  id: string;
}

export interface OpenApiRemoteMethodParameter<Parameters extends Record<string, any> | void = any, RequestBody = any> {
  parameters?: Parameters,
  requestBody?: RequestBody
}

export interface OpenApiRemoteMethod<Response = any, Parameters extends Record<string, any> | void = any, RequestBody = any>
  extends SchemaValidationMixin<Response, Parameters, RequestBody> {}

@Mixin(SchemaValidationMixin)
@Injectable()
export class OpenApiRemoteMethod<Response = any, Parameters extends Record<string, any> | void = any, RequestBody = any>
  extends BaseHttpRemoteMethod<Response, any, OpenApiRemoteMethodParameter<Parameters, RequestBody>> {

  public get operation(): OperationObjectWithMetadata {
    return this.metadata.operation;
  }

  private readonly strict: boolean = false;

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(Injector) injector: Injector,
    @Inject(OpenApiConfigService) openApiConfigService: OpenApiConfigService,
    @Optional()
    @Inject(DEFAULT_OPEN_API_REMOTE_METHOD_META_DATA)
      metadata: OpenApiRemoteMethodMetadata | null = null,
    @Optional()
    @Inject(RXAP_OPEN_API_STRICT_VALIDATOR)
      strict: boolean | null                       = null
  ) {
    super(http, injector, metadata);
    let operation: OperationObjectWithMetadata;
    if (!this.metadata.operation) {
      this.metadata.operation = operation = openApiConfigService.getOperation(this.metadata.id);
    } else {
      operation = this.metadata.operation;
    }
    this.applyMetadata({
      id:     operation.operationId,
      url:    () => joinPath(openApiConfigService.getBaseUrl(this.metadata.serverIndex), operation.path),
      method: operation.method as any
    });
    this.strict = strict || this.metadata.strict || false;
  }

  protected async _call(args: OpenApiRemoteMethodParameter<Parameters, RequestBody> = {}): Promise<Response> {

    this.validateParameters(this.operation, args.parameters, this.strict);
    this.validateRequestBody(this.operation, args.requestBody, this.strict);

    const response = await this._callWithResponse(args);

    if (response.body) {
      return response.body;
    }

    throw new Error('The response body is empty!');
  }

  /**
   * Instead of returning the response body the full response object is returned
   */
  public async callWithResponse(args: OpenApiRemoteMethodParameter<Parameters, RequestBody> = {}): Promise<HttpResponse<Response>> {
    this.init();
    this.executionsInProgress$.increase();
    const result = await this._callWithResponse(args);
    this.executionsInProgress$.decrease();
    if (result.body) {
      this.executed$.next(result.body);
      this.executed(result.body);
    }
    return result;
  }

  // TODO : update to the new call method concept (the remove of the _call method concept)
  public _callWithResponse(args: OpenApiRemoteMethodParameter<Parameters, RequestBody> = {}): Promise<HttpResponse<Response>> {

    this.validateParameters(this.operation, args.parameters, this.strict);
    this.validateRequestBody(this.operation, args.requestBody, this.strict);

    return this.http.request<Response>(this.updateRequest(this.buildHttpOptions(this.operation, args.parameters, args.requestBody))).pipe(
      retry(this.metadata.retry ?? 0),
      catchError((response: HttpErrorResponse) => {
        this.interceptors?.forEach(interceptor => interceptor
          .next({ response, parameters: args.parameters, requestBody: args.requestBody })
        );
        return throwError(response);
      }),
      filter((event: any) => event.type === HttpEventType.Response),
      tap((response: HttpResponse<Response>) => this.validateResponse(this.operation, response, this.strict)),
      tap((response: HttpResponse<Response>) => {
        this.interceptors?.forEach(interceptor => interceptor
          .next({ response, parameters: args.parameters, requestBody: args.requestBody })
        );
      }),
      take(1),
      timeout(this.timeout)
    ).toPromise();

  }

}
