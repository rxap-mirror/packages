import { AxiosRequestConfig } from 'axios/index';

export interface OpenApiServerConfig {
  id: string;
  url: string;
}

export interface OpenApiUpstreamInterceptor {

  intercept(config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig>;

}

export interface OpenApiOperationCommandWithoutParameters {
  skipInterceptors?: boolean,
}

export interface OpenApiOperationCommandParameters<Parameters extends Record<string, any> | void = any, RequestBody = any>
  extends OpenApiOperationCommandWithoutParameters {
  parameters?: Parameters,
  body?: RequestBody,

}

export type HttpParamType = string | number | boolean | Array<string | number | boolean>;
