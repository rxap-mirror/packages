import { StandaloneApplication } from '@rxap/ngx-bootstrap';
import { SentryInit } from '@rxap/ngx-sentry';
import { OpenApiInit } from '@rxap/open-api';
import { UnregisterServiceWorker } from '@rxap/service-worker';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

const application = new StandaloneApplication(
  environment,
  AppComponent,
  appConfig,
  {
    static: {}
  }
);
application.before(() => UnregisterServiceWorker(environment));
application.before(() => OpenApiInit(environment));
application.before(() => SentryInit(environment));
application.bootstrap().catch((err) => console.error(err));
