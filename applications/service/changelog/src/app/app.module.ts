import { CacheModule } from '@nestjs/cache-manager';
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
import { ServeStaticModule } from '@nestjs/serve-static';
import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
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
import { join } from 'path';
import { ChangelogModule } from '../changelog/changelog.module';
import { environment } from '../environments/environment';
import { VALIDATION_SCHEMA } from './app.config';

import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HealthModule,
    ServeStaticModule.forRootAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: (config: ConfigService) => [
        {
          rootPath: config.getOrThrow('DATA_DIR'),
          serveRoot: '/' + join(config.getOrThrow('GLOBAL_API_PREFIX'), 'data'),
          serveStaticOptions: {
            setHeaders: (res) => {
              res.set('Cross-Origin-Resource-Policy', 'cross-origin');
            },
          },
        },
      ],
    }),
    CacheModule.register({
      isGlobal: true,
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
        imports: [ ConfigModule ],
        inject: [ ConfigService ],
        useFactory: SentryOptionsFactory(environment),
      }, {
        logLevels: GetLogLevels(),
      }),
    ChangelogModule,
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
  ],
})
export class AppModule {}
