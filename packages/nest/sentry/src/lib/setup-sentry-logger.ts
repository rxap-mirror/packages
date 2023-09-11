import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RxapLogger } from '@rxap/nest-logger';
import { SentryLogger } from './sentry.logger';

export function SetupSentryLogger() {
  return (app: INestApplication, config: ConfigService) => {
    if (config.get('SENTRY_ENABLED')) {
      app.useLogger(app.get(SentryLogger));
    } else {
      app.useLogger(new RxapLogger());
    }
  };
}
