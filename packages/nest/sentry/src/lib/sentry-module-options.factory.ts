import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SentryModuleOptions } from '@rxap/nest-sentry';
import { GetLogLevels } from '@rxap/nest-utilities';
import { GetSentryLogLevels } from './get-sentry-log-levels';

@Injectable()
export class SentryModuleOptionsFactory
  implements ConfigurableModuleOptionsFactory<SentryModuleOptions, 'create'>
{
  @Inject(ConfigService)
  protected readonly config!: ConfigService;

  // Do not inject the logger, because it will be created circularly with the SentryModule
  // @Inject(Logger)
  // protected readonly logger!: Logger;

  // Do not inject the logger, because it will be created circularly with the SentryModule
  // @Optional()
  // @Inject(CONSOLE_LOGGER_OPTIONS)
  // protected readonly options?: ConsoleLoggerOptions;

  async create(): Promise<SentryModuleOptions> {
    return {
      logLevels: GetSentryLogLevels(this.config.getOrThrow('SENTRY_LOG_LEVEL')),
      logger: {
        timestamp: true,
        logLevels: GetLogLevels(),
      },
      enabled: this.config.getOrThrow('SENTRY_ENABLED'),
    };
  }
}
