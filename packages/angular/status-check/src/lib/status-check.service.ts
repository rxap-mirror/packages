import {
  Inject,
  Injectable,
  InjectionToken,
} from '@angular/core';
import { OpenApiHttpResponseError } from '@rxap/open-api';
import { Method } from '@rxap/pattern';
import { ToggleSubject } from '@rxap/rxjs';
import * as Sentry from '@sentry/angular-ivy';
import {
  combineLatest,
  defer,
  interval,
  Observable,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  throttleTime,
} from 'rxjs';
import {
  map,
  tap,
} from 'rxjs/operators';

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

export const STATUS_CHECK_ALL_METHOD = new InjectionToken<Method<ApiStatus>>('STATUS_CHECK_ALL_METHOD');
export const STATUS_CHECK_SERVICE_METHOD = new InjectionToken<Method<ApiStatus, string>>('STATUS_CHECK_SERVICE_METHOD');

@Injectable({ providedIn: 'root' })
export class StatusCheckService {

  public readonly isChecking$ = new ToggleSubject(false);
  public readonly isHealthy$: Observable<boolean>;
  private readonly recheck$ = new Subject<void>();
  status$: Observable<ApiStatus> = defer(() => combineLatest(
    [
      interval(60 * 1000),
      this.recheck$,
    ]).pipe(
    tap(() => this.isChecking$.enable()),
    throttleTime(1000 * 10),
    startWith(0),
    switchMap(() => this.getStatus()),
    shareReplay(1),
  ));

  constructor(
    @Inject(STATUS_CHECK_ALL_METHOD)
    private readonly getAllStatusMethod: Method<ApiStatus>,
    @Inject(STATUS_CHECK_SERVICE_METHOD)
    private readonly getServiceStatusMethod: Method<ApiStatus, string>,
  ) {
    this.isHealthy$ = this.status$.pipe(map(status => status.status === 'ok'));
  }

  public recheck() {
    console.log('recheck');
    this.recheck$.next();
  }

  public async isHealthy(serviceName?: string): Promise<boolean> {
    return Promise.resolve(true);
  }

  private async getStatus(serviceName?: string): Promise<ApiStatus> {
    let status: ApiStatus = { status: 'panic' };
    try {
      if (serviceName) {
        status = await this.getServiceStatusMethod.call(serviceName);
      } else {
        status = await this.getAllStatusMethod.call();
      }
    } catch (error) {
      this.handleStatusCheckError(error, status);
    }
    this.isChecking$.disable();
    return status;
  }

  private handleStatusCheckError(error: any, status: ApiStatus, serviceName?: string) {
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
