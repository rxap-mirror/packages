import {
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios/index';
import { Scope } from '@sentry/core';

import { OperationObjectWithMetadata } from '../types';

export class OpenApiOperationCommandException extends Error {

  constructor(
    public readonly serverId: string,
    public readonly response: AxiosResponse<unknown>,
    public readonly config: AxiosRequestConfig,
    public readonly operation: OperationObjectWithMetadata,
    public readonly requestId: string,
    message?: string,
  ) {
    super(message);
    this.name =
      `UpstreamAPI Error - [${ config.method?.toUpperCase() }] ${ response.status } ${ operation.operationId }@${ this.serverId }`;
  }

  setScope(scope: Scope) {
    scope.setExtra('upstreamRequest', {
      body: this.config.data ?? '<empty>',
      headers: Object.keys(this.config.headers ?? {}).length ? this.config.headers : '<none>',
      url: this.config.url,
      params: Object.keys(this.config.params ?? {}).length ? this.config.params : '<none>',
    });
    scope.setExtra('upstreamResponse', {
      body: this.response.data,
      status: this.response.status,
    });
    scope.setTag('operationId', this.operation.operationId);
    scope.setTag('upstreamServerId', this.serverId);
  }

}
