import {
  ConfigurableModuleOptionsFactory,
  Inject,
  Injectable,
  Logger,
  Optional,
} from '@nestjs/common';
import { ConsoleLoggerOptions } from '@nestjs/common/services/console-logger.service';
import { ConfigService } from '@nestjs/config';
import { CONSOLE_LOGGER_OPTIONS } from '@rxap/nest-logger';
import { SentryModuleOptions } from '@rxap/nest-sentry';
import { GetLogLevels } from '@rxap/nest-utilities';
import { GetSentryLogLevels } from './get-sentry-log-levels';

@Injectable()
export class SentryModuleOptionsFactory
  implements ConfigurableModuleOptionsFactory<SentryModuleOptions, 'create'>
{
  @Inject(ConfigService)
  protected readonly config!: ConfigService;

  @Inject(Logger)
  protected readonly logger!: Logger;

  @Optional()
  @Inject(CONSOLE_LOGGER_OPTIONS)
  protected readonly options?: ConsoleLoggerOptions;

  async create(): Promise<SentryModuleOptions> {
    return {
      logLevels: GetSentryLogLevels(this.config.getOrThrow('SENTRY_LOG_LEVEL')),
      logger: {
        timestamp: true,
        logLevels: GetLogLevels(),
        ...this.options ?? {},
      }
    };
  }
}
