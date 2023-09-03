import {
  Inject,
  Injectable,
  InjectionToken,
  isDevMode,
} from '@angular/core';
import { OpenApiHttpResponseError } from '@rxap/open-api';
import { Method } from '@rxap/pattern';
import * as Sentry from '@sentry/angular-ivy';
import {
  from,
  Observable,
  startWith,
} from 'rxjs';

export interface ApiStatus {
  status: string;
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

export type ServiceStatusCheckMethod = Method<ApiStatus, { parameters: { service: string[] } }>;

export const SERVICE_STATUS_CHECK_METHOD = new InjectionToken<ServiceStatusCheckMethod>('SERVICE_STATUS_CHECK_METHOD');

@Injectable({ providedIn: 'root' })
export class StatusCheckService {

  constructor(
    @Inject(SERVICE_STATUS_CHECK_METHOD)
    private readonly getServiceStatusMethod: ServiceStatusCheckMethod,
  ) {}

  public getStatus(serviceNames: string[]): Observable<ApiStatus> {
    const loading = {
      status: 'loading',
      info: serviceNames.reduce((acc, serviceName) => ({
        ...acc,
        [serviceName]: { status: 'loading' },
      }), {}),
    };
    return from(this.requestStatus(serviceNames)).pipe(
      startWith(loading),
    );
  }

  private async requestStatus(serviceNames: string[]): Promise<ApiStatus> {
    if (serviceNames.length === 0) {
      return { status: 'empty' };
    }
    let status: ApiStatus = { status: 'fatal' };
    try {
      status = await this.getServiceStatusMethod.call({ parameters: { service: serviceNames.slice() } });
    } catch (error) {
      status = this.handleStatusCheckError(error, status, serviceNames);
    }
    status.status ??= 'unknown';
    return status;
  }

  private handleStatusCheckError(error: any, status: ApiStatus, serviceNames: string[]) {
    if (error instanceof OpenApiHttpResponseError) {
      switch (error.status) {

        case 503:
          Sentry.captureMessage(`API is unhealthy`, {
            level: 'error',
            contexts: {
              response: {
                status: error.status,
                message: error.message,
                operationId: error.operationId,
              },
              status: error.httpErrorResponse.error,
              services: {
                text: serviceNames.join(', '),
                serviceNames,
              },
            },
          });
          status = error.httpErrorResponse.error;
          break;

        case 500:
          Sentry.captureMessage(`Internal Server Error while requesting api status`, {
            level: 'fatal',
            contexts: {
              response: {
                status: error.status,
                message: error.message,
                operationId: error.operationId,
              },
              services: {
                text: serviceNames.join(', '),
                serviceNames,
              },
            },
          });
          if (isDevMode()) {
            console.error(`Internal Server Error while requesting api status`, error);
          }
          status = { status: 'internal-server-error' };
          break;

        case 502:
          Sentry.captureMessage(`Bad gateway while requesting api status`, {
            level: 'fatal',
            contexts: {
              response: {
                status: error.status,
                message: error.message,
                operationId: error.operationId,
              },
              services: {
                text: serviceNames.join(', '),
                serviceNames,
              },
            },
          });
          if (isDevMode()) {
            console.error(`Bad gateway while requesting api status`, error);
          }
          status = { status: 'bad-gateway' };
          break;

        case 504:
          Sentry.captureMessage(`Gateway timeout while requesting api status`, {
            level: 'fatal',
            contexts: {
              response: {
                status: error.status,
                message: error.message,
                operationId: error.operationId,
              },
              services: {
                text: serviceNames.join(', '),
                serviceNames,
              },
            },
          });
          if (isDevMode()) {
            console.error(`Gateway timeout while requesting api status`, error);
          }
          status = { status: 'gateway-timeout' };
          break;

        case 405:
          Sentry.captureMessage(`Method not found while requesting api status`, {
            level: 'fatal',
            contexts: {
              response: {
                status: error.status,
                message: error.message,
                operationId: error.operationId,
              },
              services: {
                text: serviceNames.join(', '),
                serviceNames,
              },
            },
          });
          if (isDevMode()) {
            console.error(`Method not found while requesting api status`, error);
          }
          status = { status: 'method-not-found' };
          break;

        case 401:
          Sentry.captureMessage(`Unauthorized while requesting api status`, {
            level: 'fatal',
            contexts: {
              response: {
                status: error.status,
                message: error.message,
                operationId: error.operationId,
              },
              services: {
                text: serviceNames.join(', '),
                serviceNames,
              },
            },
          });
          if (isDevMode()) {
            console.error(`Unauthorized while requesting api status`, error);
          }
          status = { status: 'unauthorized' };
          break;

        case 429:
          Sentry.captureMessage(`Rate limiting while requesting api status`, {
            level: 'fatal',
            contexts: {
              response: {
                status: error.status,
                message: error.message,
                operationId: error.operationId,
              },
              services: {
                text: serviceNames.join(', '),
                serviceNames,
              },
            },
          });
          if (isDevMode()) {
            console.error(`Rate limiting while requesting api status`, error);
          }
          status = { status: 'rate-limiting' };
          break;

        default:
          Sentry.captureMessage(`An unexpected HTTP Status code while requesting api status`, {
            level: 'fatal',
            contexts: {
              response: {
                status: error.status,
                message: error.message,
                operationId: error.operationId,
              },
              services: {
                text: serviceNames.join(', '),
                serviceNames,
              },
            },
          });
          if (isDevMode()) {
            console.error(`An unexpected HTTP Status code while requesting api status`, error);
          }
          status = { status: 'unknown' };
          break;

      }
    } else {
      Sentry.captureMessage(`API status request failed: ${ error.message }`, {
        level: 'fatal',
        contexts: {
          error: {
            message: error.message,
            stack: error.stack,
          },
          services: {
            text: serviceNames.join(', '),
            serviceNames,
          },
        },
      });
      if (isDevMode()) {
        console.error(`API status request failed`, error);
      }
    }
    return status;
  }

}
