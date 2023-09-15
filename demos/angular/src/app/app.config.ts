import {
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { ProvideEnvironment } from '@rxap/environment';
import { ProvideChangelog } from '@rxap/ngx-changelog';
import {
  HttpErrorInterceptor,
  ProvideErrorHandler,
} from '@rxap/ngx-error';
import { SERVICE_STATUS_CHECK_METHOD } from '@rxap/ngx-status-check';
import { MarkdownModule } from 'ngx-markdown';
import { StatusControllerHealthCheckRemoteMethod } from 'open-api-service-status/remote-methods/status-controller-health-check.remote-method';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(MarkdownModule.forRoot()),
    provideHttpClient(withInterceptors([ HttpErrorInterceptor ])),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
    ProvideErrorHandler(),
    ProvideChangelog(),
    ProvideEnvironment(environment),
    {
      provide: SERVICE_STATUS_CHECK_METHOD,
      useClass: StatusControllerHealthCheckRemoteMethod,
    },
  ],
};
