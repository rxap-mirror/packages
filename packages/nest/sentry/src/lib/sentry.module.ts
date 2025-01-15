import {
  ConfigurableModuleBuilder,
  ConsoleLoggerOptions,
  DynamicModule,
  Global,
  HttpException,
  Logger,
  Module,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CONSOLE_LOGGER_OPTIONS, RxapLogger } from '@rxap/nest-logger';
import {
  SentryInterceptorOptions,
  SentryModuleOptions,
} from './sentry.interfaces';
import { SentryLogger } from './sentry.logger';
import { SentryService } from './sentry.service';
import {
  SENTRY_INTERCEPTOR_OPTIONS,
  SENTRY_MODULE_OPTIONS,
} from './tokens';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { SentryInterceptor } from './sentry.interceptor';

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<SentryModuleOptions>()
  .setExtras({
    isGlobal: true,
  })
  .build();

export const DEFAULT_SENTRY_INTERCEPTOR_OPTIONS: SentryInterceptorOptions = {
  filters: [
    {
      type: HttpException,
      filter: (exception: HttpException) => 500 > exception.getStatus(),
    },
  ],
};

@Global()
@Module({
  providers: [
    {
      provide: Logger,
      useFactory: (config: ConfigService, sentry: SentryLogger, rxap: RxapLogger) => {
        if (config.get('SENTRY_ENABLED')) {
          return sentry;
        } else {
          return rxap;
        }
      },
      inject: [ ConfigService, SentryLogger, RxapLogger ],
    },
    SentryLogger,
    RxapLogger,
    SentryService
  ],
  exports: [ Logger, SentryService ],
})
export class SentryModule extends ConfigurableModuleClass {

  static register(options: typeof OPTIONS_TYPE = {}, consoleLoggerOptions: ConsoleLoggerOptions = {}): DynamicModule {
    return this.updateProviders(super.register(options), consoleLoggerOptions);
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE, consoleLoggerOptions: ConsoleLoggerOptions = {}): DynamicModule {
    return this.updateProviders(super.registerAsync(options), consoleLoggerOptions);
  }

  private static updateProviders(module: DynamicModule, {
    timestamp,
    logLevels,
    ...consoleLoggerOptions
  }: ConsoleLoggerOptions) {
    module.providers ??= [];
    module.providers.push({
      provide: SENTRY_MODULE_OPTIONS,
      useExisting: MODULE_OPTIONS_TOKEN,
    });
    module.providers.push({
      provide: CONSOLE_LOGGER_OPTIONS,
      useValue: {
        ...consoleLoggerOptions,
        timestamp: timestamp ?? true,
        logLevels: logLevels ?? [ 'log', 'error', 'warn' ],
      },
    });
    module.providers.push({
      provide: SENTRY_INTERCEPTOR_OPTIONS,
      useFactory: (options: SentryModuleOptions) => options.interceptors ?? DEFAULT_SENTRY_INTERCEPTOR_OPTIONS,
      inject: [MODULE_OPTIONS_TOKEN]
    });
    module.providers.push({
      provide: APP_INTERCEPTOR,
      useClass: SentryInterceptor,
    });
    return module;
  }

  public static forRoot(
    options: typeof OPTIONS_TYPE, consoleLoggerOptions: ConsoleLoggerOptions = {}
  ): DynamicModule {
    return this.register(options, consoleLoggerOptions);
  }

  public static forRootAsync(
    options: typeof ASYNC_OPTIONS_TYPE, consoleLoggerOptions: ConsoleLoggerOptions = {}
  ): DynamicModule {
    return this.registerAsync(options, consoleLoggerOptions);
  }

}
