import {
  DynamicModule,
  Global,
  Module,
  Provider,
  Type,
} from '@nestjs/common';
import { ConsoleLoggerOptions } from '@nestjs/common/services/console-logger.service';
import {
  ISentryOptionsFactory,
  SentryModuleAsyncOptions,
  SentryModuleOptions,
} from './sentry.interfaces';
import { SentryLogger } from './sentry.logger';
import { SentryService } from './sentry.service';
import {
  CONSOLE_LOGGER_OPTIONS,
  SENTRY_MODULE_OPTIONS,
} from './tokens';

@Global()
@Module({
  providers: [ SentryLogger, SentryService ],
  exports: [ SentryLogger, SentryService ],
})
export class SentryModule {
  public static forRoot(
    options: SentryModuleOptions,
    {
      timestamp,
      logLevels,
    }: ConsoleLoggerOptions = {},
  ): DynamicModule {
    return {
      exports: [ SentryService ],
      module: SentryModule,
      providers: [
        {
          provide: SENTRY_MODULE_OPTIONS,
          useValue: options,
        },
        {
          provide: CONSOLE_LOGGER_OPTIONS,
          useValue: {
            timestamp: timestamp ?? true,
            logLevels: logLevels ?? [ 'log', 'error', 'warn' ],
          },
        },
      ],
    };
  }

  public static forRootAsync(
    options: SentryModuleAsyncOptions,
    {
      timestamp,
      logLevels,
    }: ConsoleLoggerOptions = {},
  ): DynamicModule {
    return {
      exports: [ SentryService ],
      imports: options.imports,
      module: SentryModule,
      providers: [
        ...this.createAsyncProviders(options),
        {
          provide: CONSOLE_LOGGER_OPTIONS,
          useValue: {
            timestamp: timestamp ?? true,
            logLevels: logLevels ?? [ 'log', 'error', 'warn' ],
          },
        },
      ],
    };
  }

  private static createAsyncProviders(
    options: SentryModuleAsyncOptions,
  ): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [ this.createAsyncOptionsProvider(options) ];
    }
    const useClass = options.useClass as Type<ISentryOptionsFactory>;
    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: useClass,
        useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: SentryModuleAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        inject: options.inject || [],
        provide: SENTRY_MODULE_OPTIONS,
        useFactory: options.useFactory,
      };
    }
    const inject = [
      (options.useClass || options.useExisting) as Type<ISentryOptionsFactory>,
    ];
    return {
      provide: SENTRY_MODULE_OPTIONS,
      useFactory: async (optionsFactory: ISentryOptionsFactory) =>
        await optionsFactory.createSentryModuleOptions(),
      inject,
    };
  }

}
