import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import {
  HttpErrorInterceptor,
  ProvideErrorHandler,
} from '@rxap/ngx-error';
import { SERVICE_STATUS_CHECK_METHOD } from '@rxap/ngx-status-check';
import { StatusControllerHealthCheckRemoteMethod } from 'open-api-service-status/remote-methods/status-controller-health-check.remote-method';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([ HttpErrorInterceptor ])),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
    ProvideErrorHandler(),
    {
      provide: RXAP_ENVIRONMENT,
      useValue: environment,
    },
    {
      provide: SERVICE_STATUS_CHECK_METHOD,
      useClass: StatusControllerHealthCheckRemoteMethod,
    },
  ],
};
