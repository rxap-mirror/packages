import { Project } from 'ts-morph';
import { ExtractExistingConfigValidation } from './extract-existing-config-validation';

describe('ExtractExistingConfigValidation', () => {



  let project: Project;

  beforeEach(() => {
    project = new Project({ useInMemoryFileSystem: true });
  });

  it('should extract the existing config validation', () => {
    const content = `import { HttpException, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ENVIRONMENT, GetLogLevels, SentryOptionsFactory } from '@rxap/nest-utilities';
import { SENTRY_INTERCEPTOR_OPTIONS, SentryInterceptor, SentryModule } from '@rxap/nest-sentry';
import * as Joi from 'joi';
import { environment } from '../environments/environment';
import { JobExecutionTableModule } from '../job-execution-table/job-execution-table.module';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';
import { OpenApiModule } from '@rxap/nest-open-api';
import { ReportModule } from '../report/report.module';
import { ServerConfig } from 'nest-open-api';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: (config: ConfigService) => ({
        ttl: config.getOrThrow('THROTTLER_TTL'),
        limit: config.getOrThrow('THROTTLER_LIMIT'),
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3652),
        GLOBAL_API_PREFIX: Joi.string().default('api/feature/report'),
        SENTRY_DSN: Joi.string().default(
          'https://95d1d8694ba54d16b554809088ecb448@sentry.eurogard.cloud/21',
        ),
        SENTRY_ENABLED: Joi.boolean().default(
          environment.sentry?.enabled ?? false,
        ),
        SENTRY_ENVIRONMENT: Joi.string(),
        SENTRY_RELEASE: Joi.string(),
        SENTRY_SERVER_NAME: Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-feature-report'),
        SENTRY_DEBUG: Joi.boolean().default(environment.sentry?.debug ?? false),

        LEGACY_BASE_URL: Joi.string().default('http://cloud-server:8082'),

        ROOT_DOMAIN: Joi.string().required(),
        FILE_DOWNLOAD_TOKEN_KEY: Joi.string().default('FILE_DOWNLOAD_TOKEN_KEY'),
        FILE_DOWNLOAD_JWT_SECRET: Joi.string().default('FILE_DOWNLOAD_JWT_SECRET'),
      }),
    }),
    HealthModule,
    OpenApiModule.registerAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: (config: ConfigService) => ({
        serverConfig: ServerConfig(config),
      }),
    }),
    SentryModule.forRootAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: SentryOptionsFactory(environment),
    }, {logLevels: GetLogLevels()}),
    JobExecutionTableModule,
    ReportModule,
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
export class AppModule {
}
`;
    const sourceFile = project.createSourceFile('app.module.ts', content);
    expect(JSON.stringify(ExtractExistingConfigValidation(sourceFile))).toEqual(JSON.stringify([
      {
        'builder': () => {},
        'name': 'PORT',
        'text': 'Joi.number().default(3652)',
      },
      {
        'builder': () => {},
        'name': 'GLOBAL_API_PREFIX',
        'text': 'Joi.string().default(\'api/feature/report\')',
      },
      {
        'builder': () => {},
        'name': 'SENTRY_DSN',
        'text': 'Joi.string().default(\n          \'https://95d1d8694ba54d16b554809088ecb448@sentry.eurogard.cloud/21\',\n        )',
      },
      {
        'builder': () => {},
        'name': 'SENTRY_ENABLED',
        'text': 'Joi.boolean().default(\n          environment.sentry?.enabled ?? false,\n        )',
      },
      {
        'builder': () => {},
        'name': 'SENTRY_ENVIRONMENT',
        'text': 'Joi.string()',
      },
      {
        'builder': () => {},
        'name': 'SENTRY_RELEASE',
        'text': 'Joi.string()',
      },
      {
        'builder': () => {},
        'name': 'SENTRY_SERVER_NAME',
        'text': 'Joi.string().default(process.env.ROOT_DOMAIN ?? \'service-feature-report\')',
      },
      {
        'builder': () => {},
        'name': 'SENTRY_DEBUG',
        'text': 'Joi.boolean().default(environment.sentry?.debug ?? false)',
      },
      {
        'builder': () => {},
        'name': 'LEGACY_BASE_URL',
        'text': 'Joi.string().default(\'http://cloud-server:8082\')',
      },
      {
        'builder': () => {},
        'name': 'ROOT_DOMAIN',
        'text': 'Joi.string().required()',
      },
      {
        'builder': () => {},
        'name': 'FILE_DOWNLOAD_TOKEN_KEY',
        'text': 'Joi.string().default(\'FILE_DOWNLOAD_TOKEN_KEY\')',
      },
      {
        'builder': () => {},
        'name': 'FILE_DOWNLOAD_JWT_SECRET',
        'text': 'Joi.string().default(\'FILE_DOWNLOAD_JWT_SECRET\')',
      },
    ]));

  });

  it('should not fail on external schema map for config module', () => {
    const content = `import {
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
import { environment } from '../environments/environment';
import { StatusModule } from '../status/status.module';
import { VALIDATION_SCHEMA } from './app.config';
import { AppController } from './app.controller';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    HealthModule,
    StatusModule,
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
  ],
})
export class AppModule {}
`;
    const sourceFile = project.createSourceFile('app.module.ts', content);
    expect(JSON.stringify(ExtractExistingConfigValidation(sourceFile))).toEqual(JSON.stringify([]));
  });

});
