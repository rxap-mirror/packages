import {
  ConfigurableModuleBuilder,
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
export class SentryModule extends ConfigurableModuleClass {

  static register(
    options: typeof OPTIONS_TYPE,
    printMessagesFunction: PrintMessagesFunction | null = null
  ): DynamicModule {
    return this.updateProviders(super.register(options), printMessagesFunction);
  }

  static registerAsync(
    options: typeof ASYNC_OPTIONS_TYPE,
    printMessagesFunction: PrintMessagesFunction | null = null
  ): DynamicModule {
    return this.updateProviders(super.registerAsync(options), printMessagesFunction);
  }

  private static updateProviders(module: DynamicModule, printMessagesFunction: PrintMessagesFunction | null) {
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
