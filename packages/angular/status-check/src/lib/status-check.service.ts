import {
  Inject,
  Injectable,
  InjectionToken,
} from '@angular/core';
import { OpenApiHttpResponseError } from '@rxap/open-api';
import { Method } from '@rxap/pattern';
import { log } from '@rxap/rxjs';
import * as Sentry from '@sentry/angular-ivy';
import {
  from,
  Observable,
  startWith,
} from 'rxjs';

export interface ApiStatus {
  status?: string;
  info?: Record<string, {
    status?: string;
  } & Record<string, string>>;
  error?: Record<string, {
    status?: string;
  } & Record<string, string>>;
  details?: Record<string, {
    status?: string;
  } & Record<string, string>>;
}

export const SERVICE_STATUS_CHECK_METHOD = new InjectionToken<Method<ApiStatus, string[]>>('SERVICE_STATUS_CHECK_METHOD');

@Injectable({ providedIn: 'root' })
export class StatusCheckService {

  constructor(
    @Inject(SERVICE_STATUS_CHECK_METHOD)
    private readonly getServiceStatusMethod: Method<ApiStatus, string[]>,
  ) {}

  public getStatus(serviceNames: string[]): Observable<ApiStatus> {
    console.log('getStatus', serviceNames);
    return from(this.requestStatus(serviceNames)).pipe(
      startWith({
        status: 'loading',
        info: serviceNames.reduce((acc, serviceName) => ({
          ...acc,
          [serviceName]: { status: 'loading' },
        }), {}),
      }),
      log('status'),
    );
  }

  private async requestStatus(serviceNames: string[]): Promise<ApiStatus> {
    let status: ApiStatus = { status: 'fatal' };
    try {
      status = await this.getServiceStatusMethod.call(serviceNames);
    } catch (error) {
      return this.handleStatusCheckError(error, status);
    }
    return status;
  }

  private handleStatusCheckError(error: any, status: ApiStatus, serviceName?: string) {
    console.log('handleStatusCheckError', error, status, serviceName);
    if (error instanceof OpenApiHttpResponseError) {
      if (error.status === 503) {
        Sentry.captureMessage(`API${ serviceName ?
          ` for service '${ serviceName }'` :
          '' } is unhealthy and has http status 503`, {
          level: 'error',
          contexts: {
            status: error.httpErrorResponse.error,
          },
        });
        status = error.httpErrorResponse.error;
      } else {
        Sentry.captureMessage(`API${ serviceName ?
          ` for service '${ serviceName }'` :
          '' } is unavailable: ${ error.message }`, {
          level: 'fatal',
        });
        status = { status: 'unavailable' };
      }
    } else {
      Sentry.captureMessage(`${ serviceName ?
        `For service '${ serviceName }' the ` :
        '' } API status request failed: ${ error.message }`, {
        level: 'fatal',
      });
    }
    return status;
  }

}
