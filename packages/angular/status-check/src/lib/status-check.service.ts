import {
  Inject,
  Injectable,
  InjectionToken,
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
      status = await this.getServiceStatusMethod.call({ parameters: { service: serviceNames } });
    } catch (error) {
      return this.handleStatusCheckError(error, status, serviceNames);
    }
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
    }
    return status;
  }

}
