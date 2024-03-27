import {
  Inject,
  Injectable,
  Logger,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { REQUEST } from '@nestjs/core';
import { AxiosRequestConfig } from 'axios';
import { Request } from 'express';
import { OpenApiServerId } from './open-api-operation/open-api-server-id';
import { OpenApiUpstreamInterceptor } from './open-api-operation/types';

@OpenApiServerId('__default__')
@Injectable({ scope: Scope.REQUEST })
export class DefaultUpstreamInterceptor implements OpenApiUpstreamInterceptor {

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  private get authHeaderName(): string {
    return this.config.get<string>('JWT_AUTH_HEADER', 'Authorization');
  }

  private get upstreamHeaderName(): string {
    return this.config.get<string>('UPSTREAM_JWT_AUTH_HEADER', this.authHeaderName);
  }

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly logger: Logger,
  ) {
  }

  intercept(config: AxiosRequestConfig): AxiosRequestConfig {

    config.headers ??= {};
    const token = this.request.header(this.authHeaderName);
    this.logger.debug(`Inject the ${this.upstreamHeaderName} header`, 'DefaultUpstreamInterceptor');
    if (token) {
      config.headers[this.upstreamHeaderName] = this.request.header(this.authHeaderName);
    } else {
      this.logger.warn(
        `No ${this.authHeaderName} header found in the request - [${ config.method?.toUpperCase() }] ${ config.url }`,
        'DefaultUpstreamInterceptor',
      );
    }

    return config;
  }

}
