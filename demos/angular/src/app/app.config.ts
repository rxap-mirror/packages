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
import { BearerTokenInterceptor } from '@rxap/authentication';
import { ProvideEnvironment } from '@rxap/environment';
import { ProvideChangelog } from '@rxap/ngx-changelog';
import {
  HttpErrorInterceptor,
  ProvideErrorHandler,
} from '@rxap/ngx-error';
import { LanguageInterceptor } from '@rxap/ngx-localize';
import { ProvideAuth } from '@rxap/oauth';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { MarkdownModule } from 'ngx-markdown';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(MarkdownModule.forRoot()),
    provideHttpClient(withInterceptors([
      HttpErrorInterceptor,
      LanguageInterceptor,
      BearerTokenInterceptor,
    ])),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
    ProvideErrorHandler(),
    ProvideChangelog(),
    ProvideEnvironment(environment),
    provideOAuthClient(),
    ProvideAuth(),
  ],
};
