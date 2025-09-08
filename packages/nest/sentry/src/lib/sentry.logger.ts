import {
  Inject,
  Injectable,
} from '@nestjs/common';
import { ConsoleLoggerOptions } from '@nestjs/common/services/console-logger.service';
import {
  isString,
  isUndefined,
} from '@nestjs/common/utils/shared.utils';
import { ConfigService } from '@nestjs/config';
import {
  CONSOLE_LOGGER_OPTIONS,
  RxapLogger,
} from '@rxap/nest-logger';
import * as Sentry from '@sentry/node';
import { SentryModuleOptions } from './sentry.interfaces';
import {
  SENTRY_MODULE_OPTIONS,
} from './tokens';

/**
 * SentryLogger represents a logger that captures and sends log messages to Sentry.
 *
 * @injectable
 */
@Injectable()
export class SentryLogger extends RxapLogger {

  @Inject(CONSOLE_LOGGER_OPTIONS)
  protected override readonly options!: ConsoleLoggerOptions;

  @Inject(SENTRY_MODULE_OPTIONS)
  private readonly sentryOptions!: SentryModuleOptions;

  @Inject(ConfigService)
  private readonly config!: ConfigService;

  override log(message: string, ...optionalParams: any[]) {
    let asBreadcrumb = false;
    if (optionalParams.length) {
      if (typeof optionalParams[optionalParams.length - 1] === 'boolean') {
        asBreadcrumb = optionalParams.pop();
      }
    }
    const { context } = this._getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    super.log(message, ...optionalParams);
    if (!this.config.get('SENTRY_ENABLED')) {
      return;
    }
    if (this.sentryOptions.logLevels && !['log', 'info'].some(level => this.sentryOptions.logLevels!.includes(level as any))) {
      return;
    }
    try {
      asBreadcrumb ?
        Sentry.addBreadcrumb({
          message,
          level: 'log',
          data: {
            context,
          },
        }) : Sentry.logger.info(message, { data: context });
    } catch (err: any) {
      console.error('Failed to capture message with sentry: ' + err.message);
    }
  }

  override error(message: string, ...optionalParams: any[]) {
    const {
      context,
      stack,
    } = this._getContextAndStackAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    super.error(message, ...optionalParams);
    if (!this.config.get('SENTRY_ENABLED')) {
      return;
    }
    if (this.sentryOptions.logLevels && !this.sentryOptions.logLevels.includes('error')) {
      return;
    }
    try {
      Sentry.logger.error(message, {
        data: {
          context,
          stack,
        },
      });
    } catch (err: any) {
      console.error('Failed to capture message with sentry: ' + err.message);
    }
  }

  override fatal(message: string, ...optionalParams: any[]) {
    const {
      context,
      stack,
    } = this._getContextAndStackAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    super.error(message, ...optionalParams);
    if (!this.config.get('SENTRY_ENABLED')) {
      return;
    }
    if (this.sentryOptions.logLevels && !this.sentryOptions.logLevels.includes('fatal')) {
      return;
    }
    try {
      Sentry.logger.fatal(message, {
        data: {
          context,
          stack,
        },
      });
    } catch (err: any) {
      console.error('Failed to capture message with sentry: ' + err.message);
    }
  }

  override warn(message: string, ...optionalParams: any[]) {
    let asBreadcrumb = false;
    if (optionalParams.length) {
      if (typeof optionalParams[optionalParams.length - 1] === 'boolean') {
        asBreadcrumb = optionalParams.pop();
      }
    }
    const { context } = this._getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    super.warn(message, ...optionalParams);
    if (!this.config.get('SENTRY_ENABLED')) {
      return;
    }
    if (this.sentryOptions.logLevels && !['warn', 'warning'].some(level => this.sentryOptions.logLevels!.includes(level as any))) {
      return;
    }
    try {
      asBreadcrumb ?
        Sentry.addBreadcrumb({
          message,
          level: 'warning',
          data: {
            context,
          },
        }) :
        Sentry.logger.warn(message, {
          data: { context },
        });
    } catch (err: any) {
      console.error('Failed to capture message with sentry: ' + err.message);
    }
  }

  override debug(message: string, ...optionalParams: any[]) {
    let asBreadcrumb = false;
    if (optionalParams.length) {
      if (typeof optionalParams[optionalParams.length - 1] === 'boolean') {
        asBreadcrumb = optionalParams.pop();
      }
    }
    const { context } = this._getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    super.debug(message, ...optionalParams);
    if (!this.config.get('SENTRY_ENABLED')) {
      return;
    }
    if (this.sentryOptions.logLevels && !this.sentryOptions.logLevels.includes('debug')) {
      return;
    }
    try {
      asBreadcrumb ?
        Sentry.addBreadcrumb({
          message,
          level: 'debug',
          data: {
            context,
          },
        }) :
        Sentry.logger.debug(message, {
          data: { context },
        });
    } catch (err: any) {
      console.error('Failed to capture message with sentry: ' + err.message);
    }
  }

  override verbose(message: string, ...optionalParams: any[]) {
    const { context } = this._getContextAndMessagesToPrint([
      message,
      ...optionalParams,
    ]);
    super.verbose(message, ...optionalParams);
    if (!this.config.get('SENTRY_ENABLED')) {
      return;
    }
    if (this.sentryOptions.logLevels && !['verbose', 'trace'].some(level => this.sentryOptions.logLevels!.includes(level as any))) {
      return;
    }
    try {
      Sentry.logger.trace(message, {
        data: { context },
      });
    } catch (err: any) {
      console.error('Failed to capture message with sentry: ' + err.message);
    }
  }

  private _getContextAndMessagesToPrint(args: unknown[]) {
    if (args?.length <= 1) {
      return {
        messages: args,
        context: this.context,
      };
    }
    const lastElement = args[args.length - 1];
    const isContext = isString(lastElement);
    if (!isContext) {
      return {
        messages: args,
        context: this.context,
      };
    }
    return {
      context: lastElement as string,
      messages: args.slice(0, args.length - 1),
    };
  }

  private _getContextAndStackAndMessagesToPrint(args: unknown[]) {
    const {
      messages,
      context,
    } = this._getContextAndMessagesToPrint(args);
    if (messages?.length <= 1) {
      return {
        messages,
        context,
      };
    }
    const lastElement = messages[messages.length - 1];
    const isStack = isString(lastElement);
    // https://github.com/nestjs/nest/issues/11074#issuecomment-1421680060
    if (!isStack && !isUndefined(lastElement)) {
      return {
        messages,
        context,
      };
    }
    return {
      stack: lastElement as string,
      messages: messages.slice(0, messages.length - 1),
      context,
    };
  }

}
