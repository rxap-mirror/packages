import {
  Inject,
  Injectable,
  Logger,
  Scope,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { AxiosRequestConfig } from 'axios';
import { Request } from 'express';
import { OpenApiUpstreamInterceptor } from './open-api-operation/types';
import { OpenApiServerId } from './open-api-operation/open-api-server-id';

@OpenApiServerId('__default__')
@Injectable({ scope: Scope.REQUEST })
export class DefaultUpstreamInterceptor implements OpenApiUpstreamInterceptor {

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly logger: Logger,
  ) {
  }

  intercept(config: AxiosRequestConfig): AxiosRequestConfig {

    config.headers ??= {};
    const token = this.request.header('Authorization');
    this.logger.debug('Inject the Authorization header', 'DefaultUpstreamInterceptor');
    if (token) {
      config.headers['Authorization'] = this.request.header('Authorization');
    } else {
      this.logger.warn(
        `No Authorization header found in the request - [${ config.method?.toUpperCase() }] ${ config.url }`,
        'DefaultUpstreamInterceptor',
      );
    }

    return config;
  }

}
