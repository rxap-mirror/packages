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
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  CONSOLE_LOGGER_OPTIONS,
  PrintMessagesFunction,
  RXAP_LOGGER_PRINT_MESSAGES,
  RxapLogger,
} from '@rxap/nest-logger';
import { SentryInterceptor } from './sentry.interceptor';
import {
  SentryInterceptorOptions,
  SentryModuleOptions,
} from './sentry.interfaces';
import { SentryLogger } from './sentry.logger';
import {
  SENTRY_INTERCEPTOR_OPTIONS,
  SENTRY_MODULE_OPTIONS,
} from './tokens';

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
  ],
  exports: [ Logger ],
})
export class SentryModule extends ConfigurableModuleClass {

  static register(options: typeof OPTIONS_TYPE = {}, consoleLoggerOptions: ConsoleLoggerOptions = {}, printMessagesFunction: PrintMessagesFunction | null = null): DynamicModule {
    return this.updateProviders(super.register(options), consoleLoggerOptions, printMessagesFunction);
  }

  static registerAsync(options: typeof ASYNC_OPTIONS_TYPE, consoleLoggerOptions: ConsoleLoggerOptions = {}, printMessagesFunction: PrintMessagesFunction | null = null): DynamicModule {
    return this.updateProviders(super.registerAsync(options), consoleLoggerOptions, printMessagesFunction);
  }

  private static updateProviders(module: DynamicModule, {
    timestamp,
    logLevels,
    ...consoleLoggerOptions
  }: ConsoleLoggerOptions, printMessagesFunction: PrintMessagesFunction | null) {
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
    if (printMessagesFunction) {
      module.providers.push({
        provide: RXAP_LOGGER_PRINT_MESSAGES,
        useValue: printMessagesFunction
      });
    }
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
