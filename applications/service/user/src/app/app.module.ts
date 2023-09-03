import {
  Module,
  HttpException,
} from '@nestjs/common';

import { AppController } from './app.controller';
import {
  ThrottlerModule,
  ThrottlerGuard,
} from '@nestjs/throttler';
import {
  ConfigModule,
  ConfigService,
} from '@nestjs/config';
import { VALIDATION_SCHEMA } from './app.config';
import {
  APP_GUARD,
  APP_INTERCEPTOR,
} from '@nestjs/core';
import {
  ENVIRONMENT,
  GetLogLevels,
  SentryOptionsFactory,
} from '@rxap/nest-utilities';
import { environment } from '../environments/environment';
import { HealthModule } from './health/health.module';
import {
  SentryModule,
  SENTRY_INTERCEPTOR_OPTIONS,
  SentryInterceptor,
} from '@rxap/nest-sentry';
import { JwtGuardProvider } from '@rxap/nest-jwt';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    HealthModule,
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
    SentryModule.forRootAsync(
      {
        imports: [ ConfigModule ],
        inject: [ ConfigService ],
        useFactory: SentryOptionsFactory(environment),
      }, {
        logLevels: GetLogLevels(),
      }),
    JwtModule.registerAsync(
      {
        inject: [ ConfigService ],
        useFactory: (config: ConfigService) => ({}),
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
    JwtGuardProvider,
  ],
})
export class AppModule {}
