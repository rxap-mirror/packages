import {
  HttpException,
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
  SENTRY_INTERCEPTOR_OPTIONS,
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
import { MinimumTableModule } from '../minimum-table/minimum-table.module';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 1,
      limit: 10,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3613),
        GLOBAL_API_PREFIX: Joi.string().default('api/app/angular/table'),
        SENTRY_DSN: Joi.string().optional(),
        SENTRY_ENABLED: Joi.string().default(
          environment.sentry?.enabled ?? false,
        ),
        SENTRY_ENVIRONMENT: Joi.string(),
        SENTRY_RELEASE: Joi.string(),
        SENTRY_SERVER_NAME: Joi.string().default(
          process.env.ROOT_DOMAIN ?? 'service-app-angular-table',
        ),
        SENTRY_DEBUG: Joi.string().default(environment.sentry?.debug ?? false),
      }),
    }),
    HealthModule,
    SentryModule.forRootAsync(
      {
        imports: [ ConfigModule ],
        inject: [ ConfigService ],
        useFactory: SentryOptionsFactory(environment),
      },
      { logLevels: GetLogLevels() },
    ),
    MinimumTableModule,
  ],
  controllers: [ AppController ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: ENVIRONMENT,
      useValue: environment,
    },
    Logger,
    {
      provide: SENTRY_INTERCEPTOR_OPTIONS,
      useValue: {
        filters: [
          {
            type: HttpException,
            filter: (exception: HttpException) => 500 > exception.getStatus(),
          },
        ],
      },
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    },
  ],
})
export class AppModule {}
