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
  protected readonly config!: ConfigService;

  @Inject(REQUEST)
  private readonly request!: Request;

  @Inject(Logger)
  private readonly logger!: Logger;

  protected get authHeaderName(): string {
    return this.config.get<string>('JWT_AUTH_HEADER', 'Authorization');
  }

  protected get upstreamHeaderName(): string {
    return this.config.get<string>('UPSTREAM_JWT_AUTH_HEADER', this.authHeaderName);
  }

  intercept(config: AxiosRequestConfig): AxiosRequestConfig {

    config.headers ??= {};
    const token = this.request.header(this.authHeaderName);
    this.logger.debug(`Inject the '${this.upstreamHeaderName}' header`, 'DefaultUpstreamInterceptor');
    if (token) {
      config.headers[this.upstreamHeaderName] = this.request.header(this.authHeaderName);
    } else {
      this.logger.warn(
        `No '${this.authHeaderName}' header found in the request - [${ config.method?.toUpperCase() }] ${ config.url }`,
        'DefaultUpstreamInterceptor',
      );
    }

    return config;
  }

}
