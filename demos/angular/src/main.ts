import { StandaloneApplication } from '@rxap/ngx-bootstrap';
import { SentryInit } from '@rxap/ngx-sentry';
import { OpenApiInit } from '@rxap/open-api';
import { UnregisterServiceWorker } from '@rxap/service-worker';
import {
  LoggerModule,
  NgxLoggerLevel,
} from 'ngx-logger';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { environment } from './environments/environment';

const application = new StandaloneApplication(
  environment,
  AppComponent,
  appConfig,
);
application.importProvidersFrom(LoggerModule.forRoot({
  serverLoggingUrl: '/api/logs',
  level: NgxLoggerLevel.DEBUG,
  serverLogLevel: NgxLoggerLevel.ERROR,
}));
application.before(() => UnregisterServiceWorker(environment));
application.before(() => OpenApiInit());
application.before(() => SentryInit(environment));
application.bootstrap().catch((err) => console.error(err));
