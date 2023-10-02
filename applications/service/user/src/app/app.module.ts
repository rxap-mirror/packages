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
import {
  JwtGuardProvider,
  JwtModuleOptionsLoader,
} from '@rxap/nest-jwt';
import {
  OpenApiModule,
  OpenApiModuleOptionsLoader,
} from '@rxap/nest-open-api';
import {
  SENTRY_INTERCEPTOR_OPTIONS,
  SentryInterceptor,
  SentryModule,
  SentryOptionsFactory,
} from '@rxap/nest-sentry';
import {
  ENVIRONMENT,
  GetLogLevels,
  ThrottlerModuleOptionsLoader,
} from '@rxap/nest-utilities';
import { environment } from '../environments/environment';
import { ProfileModule } from '../profile/profile.module';
import { SettingsModule } from '../settings/settings.module';
import { VALIDATION_SCHEMA } from './app.config';

import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HealthModule,
    OpenApiModule.registerAsync(
      {
        isGlobal: true,
        useClass: OpenApiModuleOptionsLoader,
      }),
    ThrottlerModule.forRootAsync(
      {
        useClass: ThrottlerModuleOptionsLoader,
      }),
    ConfigModule.forRoot(
      {
        isGlobal: true,
        validationSchema: VALIDATION_SCHEMA,
      }),
    SentryModule.forRootAsync(
      {
        inject: [ ConfigService ],
        useFactory: SentryOptionsFactory(environment),
      }, {
        logLevels: GetLogLevels(),
      }),
    JwtModule.registerAsync(
      {
        global: true,
        useClass: JwtModuleOptionsLoader,
      }),
    SettingsModule,
    ProfileModule,
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
