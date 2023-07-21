import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { OpenAPIV3 } from 'openapi-types';
import {
  AxiosError,
  AxiosRequestConfig,
  AxiosResponse,
  RawAxiosRequestHeaders,
  ResponseType,
} from 'axios';
import {
  firstValueFrom,
  tap,
} from 'rxjs';
import { OPERATION_COMMAND_META_DATA_KEY } from './tokens';
import { OpenApiOperationCommandParameters } from './types';
import { HttpParams } from './http.params';
import { coerceArray } from '@rxap/utilities';
import { OpenApiConfigService } from './open-api-config.service';
import { OpenApiOperationCommandException } from './open-api-operation-command-exception';
import {
  OperationCommandOptions,
  OperationObjectWithMetadata,
} from '../types';

@Injectable()
export abstract class OpenApiOperationCommand<Response = any, Parameters extends Record<string, any> | void = any, Body = any> {

  public readonly operation: OperationObjectWithMetadata;
  public readonly serverId: string;
  /**
   * true (default) - after the requests completes the result is printed to the console
   */
  public log = true;
  /**
   * Request timeout in ms (default: 60000ms)
   */
  public timeout = 60000;
  @Inject(HttpService)
  protected readonly http!: HttpService;
  @Inject(OpenApiConfigService)
  protected readonly openApiConfigService!: OpenApiConfigService;
  @Inject(Logger)
  protected readonly logger!: Logger;

  constructor() {
    const metadata = this.getOperationFromMetaData();
    this.operation = JSON.parse(metadata.operation);
    this.serverId = metadata.serverId;
  }

  public async execute(args: OpenApiOperationCommandParameters<Parameters, Body> = {}): Promise<Response> {

    let config: AxiosRequestConfig;
    try {
      config = await this.buildRequestConfig(args);
    } catch (e: any) {
      throw new InternalServerErrorException(`Could not build command request config: ${ e.message }`);
    }

    const requestId = (function randomNum() {
      return Math.floor(Math.random() * 9999999).toFixed(0).padStart(7, '0');
    })();

    try {
      if (this.log !== false) {
        this.logger.debug(`[${ requestId }] ${ config.method?.toUpperCase() } ${ config.url }${ HttpParams.ToHttpQueryString(
          config.params) }`, this.constructor.name);
        if (config.data) {
          this.logger.verbose(`[${ requestId }] REQUEST ${ config.data }`, this.constructor.name);
        }
      }
      const now = Date.now();
      const result = await firstValueFrom(this.http.request(config).pipe(
        tap({
          next: (response: AxiosResponse) => {
            if (this.log !== false) {
              if (response.data) {
                this.logger.verbose(`[${ requestId }] RESPONSE ${ response.status } ${ JSON.stringify(response.data) } +${ Date.now() -
                now }ms`, this.constructor.name);
              } else {
                this.logger.verbose('[${id}] RESPONSE <empty>', this.constructor.name);
              }
            }
          },
          error: (error: any) => {
            if (error instanceof AxiosError) {
              if (error.config) {
                this.logger.log(`[${ requestId }] ${ error.config.method?.toUpperCase() } ${ error.status ??
                error.response?.status } ${ error.config.url }${ HttpParams.ToHttpQueryString(error.config.params) } +${ Date.now() -
                now }ms`, this.constructor.name);
                if (this.log !== false) {
                  if (error.config.data) {
                    this.logger.verbose(`[${ requestId }] REQUEST ${ error.config.data }`, this.constructor.name);
                  }
                  if (error.response) {
                    if (error.response.data) {
                      this.logger.verbose(
                        `[${ requestId }] RESPONSE ${ JSON.stringify(error.response.data) }`,
                        this.constructor.name,
                      );
                    }
                  } else {
                    console.log(error.cause);
                    this.logger.error(
                      `[${ requestId }] Internal Axios Error without response object: ${ error.message }`,
                      this.constructor.name,
                    );
                  }
                }
              } else {
                this.logger.error(
                  `[${ requestId }] AxiosError without config object: ${ error.message }`,
                  this.constructor.name,
                );
              }
            } else {
              this.logger.error(
                `[${ requestId }] NonAxiosError in command execution: ${ error.message }`,
                this.constructor.name,
              );
            }
          },
        }),
      ));

      return result.data;

    } catch (e: any) {

      if (e.isAxiosError && e instanceof AxiosError) {

        if (e.response) {
          const message = e.response.data?.message ?? e.message;
          throw new OpenApiOperationCommandException(
            this.serverId,
            e.response,
            config,
            this.operation,
            requestId,
            message,
          );
        }
        this.logger.verbose(
          `[${ requestId }] Http request throws Axios Error without response object`,
          e.message,
          this.constructor.name,
        );

      }

      this.logger.debug(
        `[${ requestId }] Http request throws non Axios Error`,
        e.message,
        e.constructor.name,
        this.constructor.name,
      );
      throw new InternalServerErrorException(e.message);

    }


  }

  protected buildUrl(args: OpenApiOperationCommandParameters<Parameters, Body>): string {
    const path = this.buildPathParams(this.operation.path, args.parameters);
    return this.openApiConfigService.buildUrl(path, this.serverId);
  }

  protected async buildRequestConfig(args: OpenApiOperationCommandParameters<Parameters, Body>): Promise<AxiosRequestConfig> {

    let config: AxiosRequestConfig = {};

    config.url = this.buildUrl(args);
    config.method = this.operation.method;
    config.data = this.buildRequestBody(args.body);
    config.params = this.buildRequestParams(args.parameters);
    config.paramsSerializer = {
      indexes: null,
    };
    config.headers = this.buildHeaders(args.parameters);
    config.responseType = this.getResponseType();
    config.timeout = this.timeout;

    if (!args.skipInterceptors) {

      const interceptors = this.openApiConfigService.getInterceptors(this.serverId);

      for (const interceptor of interceptors) {
        config = await interceptor.intercept(config);
      }

    }

    return config;
  }

  protected buildPathParams(path: string, parameters?: Parameters): string {

    const operationParameters: OpenAPIV3.ParameterObject[] = coerceArray(this.operation.parameters) as any;

    if (!operationParameters.some(p => p.in === 'path')) {
      return path;
    }

    if (!parameters) {
      throw new InternalServerErrorException(`Path parameters for operation '${ this.operation.operationId }' are not defined`);
    }

    const pathParams: Record<string, string> = {};

    for (const parameter of operationParameters.filter(p => p.in === 'path')) {

      if (parameters[parameter.name] !== undefined && parameters[parameter.name] !== null) {
        pathParams[parameter.name] = encodeURIComponent(parameters[parameter.name]);
      }

    }

    const matches = path.match(/\{[^}]+}/g);

    if (matches) {
      for (const match of matches) {
        const param = match.substr(1, match.length - 2);
        if (!pathParams[param]) {
          throw new InternalServerErrorException(`Path params for remote method '${ this.operation.operationId }' has not a defined value for '${ param }'`);
        }
        path = path.replace(match, pathParams[param]);
      }
    } else {
      throw new InternalServerErrorException(`The path of the operation '${ this.operation.operationId }' should have parameters`);
    }

    return path;
  }

  protected buildHeaders(parameters?: Parameters): RawAxiosRequestHeaders {

    const operationParameters: OpenAPIV3.ParameterObject[] = coerceArray(this.operation.parameters) as any;

    const header: RawAxiosRequestHeaders = {};

    for (const parameter of operationParameters.filter(p => p.in === 'header')) {

      if (parameters && parameters[parameter.name] !== undefined && parameters[parameter.name] !== null) {
        header[parameter.name] = parameters[parameter.name];
      } else if (parameter.required) {
        throw new InternalServerErrorException(`The header '${ parameter.name }' is required for the operation '${ this.operation.operationId }'`);
      }

    }

    function IsRequestBodyObject(obj: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject | undefined): obj is OpenAPIV3.RequestBodyObject {
      return obj && (obj as any)['content'];
    }

    if (IsRequestBodyObject(this.operation.requestBody) && this.operation.requestBody.content['application/json']) {
      header['Content-Type'] ??= 'application/json';
    }

    return header;
  }

  protected buildRequestParams(parameters?: Parameters): Record<string, unknown> {
    const operationParameters: OpenAPIV3.ParameterObject[] = coerceArray(this.operation.parameters) as any;

    if (!operationParameters.some(p => p.in === 'query')) {
      return {};
    }

    const params: Record<string, unknown> = {};

    for (const parameter of operationParameters.filter(p => p.in === 'query')) {

      if (parameters && parameters[parameter.name] !== undefined && parameters[parameter.name] !== null) {
        if (Array.isArray(parameters[parameter.name])) {
          if (parameters[parameter.name].length) {
            params[parameter.name] =
              parameters[parameter.name].map((item: any) => typeof item === 'object' ? JSON.stringify(item) : item);
          }
        } else {
          params[parameter.name] = typeof parameters[parameter.name] === 'object' ?
            JSON.stringify(parameters[parameter.name]) :
            parameters[parameter.name];
        }
      }
      if (parameter.required && params[parameter.name] === undefined) {
        throw new InternalServerErrorException(`The query '${ parameter.name }' is required for the operation '${ this.operation.operationId }'`);
      }
    }

    return params;
  }

  protected buildRequestBody(body?: Body): any {
    return body;
  }

  protected getResponseType(): ResponseType {

    const response: OpenAPIV3.ResponseObject = (this.operation.responses['200'] ??
      this.operation.responses['201']) as any;

    if (response) {
      if (response['content']) {
        if (response['content']['application/json']) {
          return 'json';
        }
      }
      return 'text';
    }

    return 'json';

  }

  protected getOperationFromMetaData(): OperationCommandOptions {
    if (!Reflect.hasMetadata(OPERATION_COMMAND_META_DATA_KEY, this.constructor)) {
      throw new InternalServerErrorException(`Ensure the @OperationCommand is used on the class '${ this.constructor.name }'`);
    }
    return Reflect.getMetadata(OPERATION_COMMAND_META_DATA_KEY, this.constructor);
  }

}
