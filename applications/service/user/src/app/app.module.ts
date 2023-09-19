import {
  HttpException,
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
import { JwtModule } from '@nestjs/jwt';
import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
import { JwtGuardProvider } from '@rxap/nest-jwt';
import { OpenApiModule } from '@rxap/nest-open-api';
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
import { environment } from '../environments/environment';
import { SettingsModule } from '../settings/settings.module';
import { VALIDATION_SCHEMA } from './app.config';

import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HealthModule,
    OpenApiModule.registerAsync(
      {
        inject: [ ConfigService ],
        imports: [ ConfigModule ],
        useFactory: (config: ConfigService) => ({}),
      }),
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
        global: true,
        inject: [ ConfigService ],
        useFactory: (config: ConfigService) => ({
          secret: config.getOrThrow('JWT_SECRET'),
        }),
      }),
    SettingsModule,
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
