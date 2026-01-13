import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import {
  ThrottlerModuleOptionsLoader,
  CacheModuleOptionsLoader,
  EnvironmentModule,
} from '@rxap/nest-utilities';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { VALIDATION_SCHEMA } from './app.config';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { environment } from '../environments/environment';
import { HealthModule } from './health/health.module';
import { SentryModule } from '@sentry/nestjs/setup';
import {
  SentryLoggerModule,
  SentryModuleOptionsFactory,
} from '@rxap/nest-sentry';
import { TestTableModule } from '../test-table/test-table.module';

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
    TestTableModule,
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
