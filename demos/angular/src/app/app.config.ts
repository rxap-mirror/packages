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
import { environment } from '../environment';
import { APP_NAVIGATION_PROVIDER } from './app.navigation';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    importProvidersFrom(HttpClientModule),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
    APP_NAVIGATION_PROVIDER,
    {
      provide: RXAP_ENVIRONMENT,
      useValue: environment,
    },
  ],
};
