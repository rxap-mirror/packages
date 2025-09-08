import {
  ConfigurableModuleBuilder,
  ConsoleLoggerOptions,
  DynamicModule,
  Global,
  Logger,
  Module,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CONSOLE_LOGGER_OPTIONS,
  PrintMessagesFunction,
  RXAP_LOGGER_PRINT_MESSAGES,
  RxapLogger,
} from '@rxap/nest-logger';
import { GetLogLevels } from '@rxap/nest-utilities';
import { SentryModuleOptions } from './sentry.interfaces';
import { SentryLogger } from './sentry.logger';
import { SENTRY_MODULE_OPTIONS } from './tokens';

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
  imports: [],
  exports: [ Logger ],
})
export class SentryLoggerModule extends ConfigurableModuleClass {

  static register(
    options: typeof OPTIONS_TYPE,
    consoleLoggerOptions: ConsoleLoggerOptions | null = null,
    printMessagesFunction: PrintMessagesFunction | null = null
  ): DynamicModule {
    return this.updateProviders(super.register(options), consoleLoggerOptions, printMessagesFunction);
  }

  static registerAsync(
    options: typeof ASYNC_OPTIONS_TYPE,
    consoleLoggerOptions: ConsoleLoggerOptions | null = null,
    printMessagesFunction: PrintMessagesFunction | null = null
  ): DynamicModule {
    return this.updateProviders(super.registerAsync(options), consoleLoggerOptions, printMessagesFunction);
  }

  private static updateProviders(module: DynamicModule, consoleLoggerOptions: ConsoleLoggerOptions | null = null, printMessagesFunction: PrintMessagesFunction | null) {
    module.providers ??= [];
    module.providers.push({
      provide: SENTRY_MODULE_OPTIONS,
      useExisting: MODULE_OPTIONS_TOKEN,
    });
    module.providers.push({
      provide: CONSOLE_LOGGER_OPTIONS,
      useFactory: (options: SentryModuleOptions) => ({
        timestamp: true,
        logLevels: GetLogLevels(),
        ...options.logger ?? {},
        ...consoleLoggerOptions ?? {},
      }),
      inject: [ SENTRY_MODULE_OPTIONS ],
    });
    if (printMessagesFunction) {
      module.providers.push({
        provide: RXAP_LOGGER_PRINT_MESSAGES,
        useValue: printMessagesFunction
      });
    }
    return module;
  }

}
