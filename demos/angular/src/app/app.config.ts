import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import {
  BearerTokenInterceptor,
  withDisabledAuthentication,
} from '@rxap/authentication';
import { ProvideEnvironment } from '@rxap/environment';
import { ProvideIconAssetPath } from '@rxap/icon';
import { provideExternalApps } from '@rxap/layout';
import { ProvideChangelog } from '@rxap/ngx-changelog';
import {
  HttpErrorInterceptor,
  ProvideErrorHandler,
} from '@rxap/ngx-error';
import { LanguageInterceptor } from '@rxap/ngx-localize';
import { ProvidePubSub } from '@rxap/ngx-pub-sub';
import { provideTheme } from '@rxap/ngx-theme';
import {
  ProvideAuth,
  withAuthConfig,
} from '@rxap/oauth';
import {
  ProvideServiceWorkerUpdater,
  withDialogUpdater,
  withLogUpdater,
} from '@rxap/service-worker';
import { provideOAuthClient } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';
import { appRoutes } from './app.routes';
import { provideMarkdown } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(withInterceptors([
      HttpErrorInterceptor,
      LanguageInterceptor,
      BearerTokenInterceptor,
    ])),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
    ProvideErrorHandler(),
    ProvideChangelog(),
    provideTheme(),
    provideExternalApps(),
    provideMarkdown(),
    ProvideEnvironment(environment),
    provideOAuthClient(),
    ProvideAuth(withAuthConfig({
      clientId: 'qXfsteM2BCmrBu42xG3SdmsANrX2FTZbSJIor5JA',
      scope: 'openid profile email',
      issuer: 'https://auth.127-0-0-1.nip.io:8443/application/o/angular/',
      skipIssuerCheck: true,
      strictDiscoveryDocumentValidation: false,
      dummyClientSecret: 'geheim',
      redirectUri: window.location.origin + '/index.html',
      // silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',
    }), withDisabledAuthentication()),
    provideServiceWorker(
      'ngsw-worker.js',
      { enabled: environment.serviceWorker, registrationStrategy: 'registerWhenStable:30000' },
    ),
    ProvideServiceWorkerUpdater(withLogUpdater(), withDialogUpdater()),
    ProvidePubSub(),
    ProvideIconAssetPath(),
  ],
};
