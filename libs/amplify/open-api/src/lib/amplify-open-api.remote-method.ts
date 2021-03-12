import {
  BaseRemoteMethod,
  REMOTE_METHOD_META_DATA,
  RxapRemoteMethodError
} from '@rxap/remote-method';
import { Mixin } from '@rxap/mixin';
import {
  SchemaValidationMixin,
  OperationObjectWithMetadata,
  OpenApiConfigService,
  RXAP_OPEN_API_STRICT_VALIDATOR
} from '@rxap/open-api';
import {
  Injectable,
  Inject,
  Injector,
  Optional
} from '@angular/core';
import {
  OpenApiRemoteMethodParameter,
  OpenApiRemoteMethodMetadata
} from '@rxap/open-api/remote-method';
import {
  joinPath,
  hasIndexSignature
} from '@rxap/utilities';
import {API} from 'aws-amplify'
import { HttpRemoteMethodParameter } from '@rxap/remote-method/http';
import { AxiosResponse } from 'axios';
import { HttpHeaders } from '@angular/common/http';

export interface AmplifyOpenApiRemoteMethod<Response = any, Parameters extends Record<string, any> = any, RequestBody = any>
  extends SchemaValidationMixin<Response, Parameters, RequestBody> {}

@Mixin(SchemaValidationMixin)
@Injectable()
export class AmplifyOpenApiRemoteMethod<Response = any, Parameters extends Record<string, any> = any, RequestBody = any>
  extends BaseRemoteMethod<Response, OpenApiRemoteMethodParameter<Parameters, RequestBody>> {

  public get operation(): OperationObjectWithMetadata {
    return this.metadata.operation;
  }

  public get apiName(): string {
    const apiNameTag = this.operation.tags?.find(tag => tag.match(/^apiName#.+$/));

    if (!apiNameTag) {
      throw new Error(`Could not find the api name in the operation tags for operation '${this.operation.operationId}'`);
    }

    return apiNameTag.replace(/^apiName#/, '');
  }

  private readonly strict: boolean = false;

  constructor(
    @Inject(Injector) injector: Injector,
    @Inject(OpenApiConfigService) openApiConfigService: OpenApiConfigService,
    @Optional() @Inject(REMOTE_METHOD_META_DATA) metadata: OpenApiRemoteMethodMetadata | null = null,
    @Optional()
    @Inject(RXAP_OPEN_API_STRICT_VALIDATOR)
      strict: boolean | null = null,
  ) {
    super(injector, metadata);
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

    const requestOptions = this.buildHttpOptions(this.operation, args.parameters, args.requestBody);

    const response = await this.request(requestOptions);

    this.validateResponse(this.operation, response, this.strict);

    // TODO : add interceptor support

    return response.data;
  }

  public buildUrlWithParams(url: string, pathParams?: Record<string, any>): string {
    if (pathParams) {

      if (!hasIndexSignature(pathParams)) {
        throw new RxapRemoteMethodError(`Path params for remote method '${this.id}' has not an index signature`, '', this.constructor.name);
      }

      const matches = url.match(/\{[^\}]+\}/g);

      if (matches) {
        for (const match of matches) {
          const param = match.substr(1, match.length - 2);
          if (!pathParams.hasOwnProperty(param)) {
            throw new RxapRemoteMethodError(`Path params for remote method '${this.id}' has not a defined value for '${param}'`, '', this.constructor.name);
          }
          url = url.replace(match, encodeURIComponent(pathParams[ param ]));
        }
      }
    }

    return url;
  }

  private _httpHeadersToObject(httpHeaders?: HttpHeaders): Record<string, any> {
    const headers: Record<string, any> = {};

    if (httpHeaders) {
      for (const key of httpHeaders.keys()) {
        headers[key] = httpHeaders.get(key);
      }
    }

    return headers;
  }

  private request(requestOptions: HttpRemoteMethodParameter): Promise<AxiosResponse> {

    const init = {
      response: true,
      withCredentials: this.metadata.withCredentials ?? false,
      headers: this._httpHeadersToObject(requestOptions.headers),
      queryStringParameters: requestOptions.params ?? {},
    };

    const path = this.buildUrlWithParams(this.operation.path, requestOptions.pathParams);

    switch (this.operation.method) {

      case 'POST':
        return API.post(this.apiName, path, init);

      case 'DELETE':
        return API.del(this.apiName, path, init);

      case 'PUT':
        return API.put(this.apiName, path, init);

      case 'PATCH':
        return API.patch(this.apiName, path, init);

      default:
      case 'GET':
        return API.get(this.apiName, path, init);

    }

  }

}
