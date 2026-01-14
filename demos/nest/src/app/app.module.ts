import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';
import {
  SentryLoggerModule,
  SentryModuleOptionsFactory,
} from '@rxap/nest-sentry';
import {
  CacheModuleOptionsLoader,
  EnvironmentModule,
  ThrottlerModuleOptionsLoader,
} from '@rxap/nest-utilities';
import { SentryModule } from '@sentry/nestjs/setup';
import { environment } from '../environments/environment';
import { VALIDATION_SCHEMA } from './app.config';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      useClass: ThrottlerModuleOptionsLoader,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: VALIDATION_SCHEMA,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useClass: CacheModuleOptionsLoader,
    }),
    EnvironmentModule.register(environment),
    HealthModule,
    SentryModule.forRoot(),
    SentryLoggerModule.registerAsync({
      useClass: SentryModuleOptionsFactory,
    }),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
