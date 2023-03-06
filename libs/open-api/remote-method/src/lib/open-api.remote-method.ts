import {
  Inject,
  Injector,
  Optional,
  Injectable,
  isDevMode
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
  DEFAULT_OPEN_API_REMOTE_METHOD_META_DATA,
  DISABLE_SCHEMA_VALIDATION,
  DISABLE_VALIDATION,
  OpenApiHttpResponseError,
  OpenApiMetaData
} from '@rxap/open-api';
import { BaseHttpRemoteMethod } from '@rxap/remote-method/http';
import { RxapRemoteMethod } from '@rxap/remote-method';
import {
  filter,
  timeout,
  retry,
  tap,
  take
} from 'rxjs/operators';
import { Mixin } from '@rxap/mixin';

export interface OperationForMetadata {
  operation: OperationObjectWithMetadata;
  /**
   * used to specify the target server for the reset api operation
   */
  serverId?: string;
  /**
   * the fallback id used if the operation does not have a operationId
   */
  fallbackId?: string;
}

export interface OperationFromMetadataInline {
  operationId: string;
  operation: string;
  /**
   * used to specify the target server for the reset api operation
   */
  serverId?: string;
}

export function IsOperationFromMetadataInline(metadata: OperationForMetadata | OperationFromMetadataInline): metadata is OperationFromMetadataInline {
  return typeof metadata.operation === 'string';
}

export function RxapOpenApiRemoteMethod(operationOrId: string | OperationForMetadata | OperationFromMetadataInline, serverIndex: number = 0) {
  return function(target: any) {
    const id = typeof operationOrId === 'string' ? operationOrId : (IsOperationFromMetadataInline(operationOrId) ? operationOrId.operationId : operationOrId.operation.operationId ?? operationOrId.fallbackId);
    if (!id) {
      throw new Error('The operationId for the open api remote method is not defined');
    }
    const metadata: OpenApiRemoteMethodMetadata = {
      id,
      serverIndex
    };
    if (typeof operationOrId !== 'string') {
      metadata.operation = operationOrId.operation;
      metadata.serverId = operationOrId.serverId;
    }
    RxapRemoteMethod(metadata)(target);
  };
}

export interface OpenApiRemoteMethodMetadata extends OpenApiMetaData {

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
  protected readonly disableSchemaValidation: boolean = false;
  protected readonly disableValidation: boolean = false;

  constructor(
    @Inject(HttpClient) http: HttpClient,
    @Inject(Injector) injector: Injector,
    @Inject(OpenApiConfigService) openApiConfigService: OpenApiConfigService,
    @Optional()
    @Inject(DEFAULT_OPEN_API_REMOTE_METHOD_META_DATA)
      metadata: OpenApiRemoteMethodMetadata | null = null,
    @Optional()
    @Inject(RXAP_OPEN_API_STRICT_VALIDATOR)
      strict: boolean | null                                   = null,
    @Optional()
    @Inject(DISABLE_SCHEMA_VALIDATION)
    disableSchemaValidation: boolean | null = null,
    @Optional()
    @Inject(DISABLE_VALIDATION)
      disableValidation: boolean | null = null
  ) {
    super(http, injector, metadata);
    this.metadata.operation ??= openApiConfigService.getOperation(this.metadata.id);
    if (typeof this.metadata.operation === 'string') {
      try {
        this.metadata.operation = JSON.parse(this.metadata.operation);
      } catch (e: any) {
        throw new Error(`could not parse the remote method operation string into an object: ${this.constructor.name}`);
      }
    }
    const operation: OperationObjectWithMetadata & { serverId?: string } = this.metadata.operation;
    this.applyMetadata({
      id:     operation.operationId,
      url:    () => openApiConfigService.getBaseUrl(this.metadata.serverIndex, this.metadata.serverId) + operation.path,
      method: operation.method as any,
      withCredentials: this.metadata.withCredentials ?? true,
      ignoreUndefined: this.metadata.ignoreUndefined ?? true,
    });
    this.strict = strict || this.metadata.strict || false;
    this.disableSchemaValidation = disableSchemaValidation || this.metadata.disableSchemaValidation || false;
    this.disableValidation = disableValidation || this.metadata.disableValidation || false;
  }

  protected async _call(args: OpenApiRemoteMethodParameter<Parameters, RequestBody> = {}): Promise<Response> {

    if (!this.disableValidation) {
      this.validateParameters(this.operation, args.parameters, this.strict);
      this.validateRequestBody(this.operation, args.requestBody, this.strict);
    }

    let response: HttpResponse<Response>;

    try {
      response = await this._callWithResponse(args);
    } catch (error: any) {
      if (error instanceof HttpErrorResponse) {
        throw new OpenApiHttpResponseError(
          error,
          this.metadata
        );
      } else {
        throw error;
      }
    }

    if (response.body) {
      return response.body;
    }

    if (isDevMode()) {
      console.warn('The response body is empty!');
    }
    return null as any;
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

    if (!this.disableValidation) {
      this.validateParameters(this.operation, args.parameters, this.strict);
      this.validateRequestBody(this.operation, args.requestBody, this.strict);
    }

    return this.http.request<Response>(this.updateRequest(this.buildHttpOptions(this.operation, args.parameters, args.requestBody, this.metadata.ignoreUndefined))).pipe(
      retry(this.metadata.retry ?? 0),
      tap({
        error: (error) => {
          if (error instanceof HttpErrorResponse) {
            this.interceptors?.forEach(interceptor => interceptor
              .next({ response: error, parameters: args.parameters, requestBody: args.requestBody })
            );
          }
        }
      }),
      filter((event: any) => event.type === HttpEventType.Response),
      tap((response: HttpResponse<Response>) => {
        if (this.disableValidation) {
          this.validateResponse(this.operation, response, this.strict);
        }
      }),
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
