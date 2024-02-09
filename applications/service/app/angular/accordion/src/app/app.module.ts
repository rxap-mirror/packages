import { Module, HttpException } from '@nestjs/common';

import { AppController } from './app.controller';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerModuleOptionsLoader, ENVIRONMENT, GetLogLevels } from '@rxap/nest-utilities';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VALIDATION_SCHEMA } from './app.config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { environment } from '../environments/environment';
import { HealthModule } from './health/health.module';
import { SentryModule, SentryOptionsFactory, SENTRY_INTERCEPTOR_OPTIONS, SentryInterceptor } from '@rxap/nest-sentry';
import { DashboardAccordionModule } from '../dashboard-accordion/dashboard-accordion.module';

@Module({
  imports: [ThrottlerModule.forRootAsync(
    {
      useClass: ThrottlerModuleOptionsLoader
    }),
    ConfigModule.forRoot(
    {
      isGlobal: true,
      validationSchema: VALIDATION_SCHEMA
    }),
    HealthModule,
    SentryModule.forRootAsync(
    {
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: SentryOptionsFactory(environment)
    },{
      logLevels: GetLogLevels()
    }),
    DashboardAccordionModule,
  ],
  controllers: [AppController],
  providers: [{
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    },
    {
      provide: ENVIRONMENT,
      useValue: environment
    },
    {
      provide: SENTRY_INTERCEPTOR_OPTIONS,
      useValue: {
        filters: [{
          type: HttpException,
          filter: (exception: HttpException) => 500 > exception.getStatus()
        }]
      }
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor
    },
  ],
})
export class AppModule {}
