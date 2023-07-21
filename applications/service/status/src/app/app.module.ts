import {
  Logger,
  Module,
} from '@nestjs/common';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import {
  APP_GUARD,
  APP_INTERCEPTOR,
} from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
import {
  SentryInterceptor,
  SentryModule,
} from '@rxap/nest-sentry';
import {
  ENVIRONMENT,
  GetLogLevels,
  SentryOptionsFactory,
} from '@rxap/nest-utilities';
import * as Joi from 'joi';
import { environment } from '../environments/environment';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';
import { StatusModule } from '../status/status.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 1,
      limit: 10,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3131),
        GLOBAL_API_PREFIX: Joi.string().default('api/status'),
        SENTRY_DSN: Joi.string().required(),
        SENTRY_ENABLED: Joi.boolean().default(environment.sentry?.enabled ?? false),
        SENTRY_ENVIRONMENT: Joi.string(),
        SENTRY_RELEASE: Joi.string(),
        SENTRY_SERVER_NAME: Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-status'),
        SENTRY_DEBUG: Joi.boolean().default(environment.sentry?.debug ?? false),

      }),
    }),
    SentryModule.forRootAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: SentryOptionsFactory(environment),
    }, { logLevels: GetLogLevels() }),
    HealthModule,
    StatusModule,
  ],
  controllers: [ AppController ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: ENVIRONMENT,
      useValue: environment,
    },
    Logger,
  ],
})
export class AppModule {}
