import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Inject,
  Injectable,
  NestInterceptor,
  Optional,
} from '@nestjs/common';
import {
  ContextType,
  HttpArgumentsHost,
  RpcArgumentsHost,
  WsArgumentsHost,
} from '@nestjs/common/interfaces';
import { Scope } from '@sentry/core';

import * as Sentry from '@sentry/nestjs';
import { addRequestDataToEvent } from '@sentry/node';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { SentryInterceptorOptions } from './sentry.interfaces';
import { SENTRY_INTERCEPTOR_OPTIONS } from './tokens';


@Injectable()
export class SentryInterceptor implements NestInterceptor {

  @Optional()
  @Inject(SENTRY_INTERCEPTOR_OPTIONS)
  protected readonly options?: SentryInterceptorOptions;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      tap({
        error: (exception: HttpException) => {
          if (this.shouldReport(exception)) {
            Sentry.withScope((scope) => {
              return this.captureException(context, scope, exception);
            });
          }
        },
      }),
    );
  }

  protected captureException(context: ExecutionContext, scope: Scope, exception: unknown) {
    if (exception && typeof exception === 'object' && typeof (exception as any)['setScope'] === 'function') {
      (exception as any)['setScope'](scope);
    }
    switch (context.getType<ContextType>()) {
      case 'http':
        return this.captureHttpException(
          scope,
          context.switchToHttp(),
          exception,
        );
      case 'rpc':
        return this.captureRpcException(
          scope,
          context.switchToRpc(),
          exception,
        );
      case 'ws':
        return this.captureWsException(
          scope,
          context.switchToWs(),
          exception,
        );
    }
  }

  private captureHttpException(scope: Scope, http: HttpArgumentsHost, exception: unknown): void {
    const data = addRequestDataToEvent({}, http.getRequest(), { include: this.options });

    scope.setExtra('req', data.request);

    if (data.extra) {
      scope.setExtras(data.extra);
    }
    if (data.user) {
      scope.setUser(data.user);
    }

    Sentry.captureException(exception);
  }

  private captureRpcException(
    scope: Scope,
    rpc: RpcArgumentsHost,
    exception: unknown,
  ): void {
    scope.setExtra('rpc_data', rpc.getData());

    Sentry.captureException(exception);
  }

  private captureWsException(
    scope: Scope,
    ws: WsArgumentsHost,
    exception: unknown,
  ): void {
    scope.setExtra('ws_client', ws.getClient());
    scope.setExtra('ws_data', ws.getData());

    Sentry.captureException(exception);
  }

  private shouldReport(exception: unknown) {
    if (!this.options?.filters) {
      return true;
    }

    return this.options.filters
               .some(({
                        type,
                        filter,
                      }: any) => !(exception instanceof type && (!filter || filter(exception))));
  }
}
