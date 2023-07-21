import { bootstrapApplication } from '@angular/platform-browser';
import { ConfigService } from '@rxap/config';
import { SentryInit } from '@rxap/ngx-sentry';
import { OpenApiInit } from '@rxap/open-api';
import { UnregisterServiceWorker } from '@rxap/service-worker';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environment';

UnregisterServiceWorker(environment);
ConfigService.Config = {
  api: {
    'service-app-angular-table': {
      baseUrl: '/api/app/angular/table',
    },
  },
};
OpenApiInit();
SentryInit(environment);
bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
