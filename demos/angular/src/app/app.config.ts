import { HttpClientModule } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { SERVICE_STATUS_CHECK_METHOD } from '@rxap/ngx-status-check';
import { StatusControllerHealthCheckRemoteMethod } from 'open-api-service-status/remote-methods/status-controller-health-check.remote-method';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(HttpClientModule),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
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
