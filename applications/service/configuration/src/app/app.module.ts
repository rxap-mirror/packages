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
import { ConfigurationModule } from '../configuration/configuration.module';
import { environment } from '../environments/environment';
import { VALIDATION_SCHEMA } from './app.config';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HealthModule,
    SentryModule.forRootAsync(
      {
        imports: [ ConfigModule ],
        inject: [ ConfigService ],
        useFactory: SentryOptionsFactory(environment),
      },
      { logLevels: GetLogLevels() },
    ),
    ConfigurationModule,
    ThrottlerModule.forRootAsync(
      {
        imports: [ ConfigModule ],
        inject: [ ConfigService ],
        useFactory: (config: ConfigService) => ({
          ttl: config.getOrThrow('THROTTLER_TTL'),
          limit: config.getOrThrow('THROTTLER_LIMIT'),
        }),
      }),
    ConfigModule.forRoot(
      {
        isGlobal: true,
        validationSchema: VALIDATION_SCHEMA,
      }),
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
