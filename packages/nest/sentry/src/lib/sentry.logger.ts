import {
  Inject,
  Injectable,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { SentryModuleOptions } from './sentry.interfaces';
import {
  CONSOLE_LOGGER_OPTIONS,
  SENTRY_MODULE_OPTIONS,
} from './tokens';
import { ConsoleLoggerOptions } from '@nestjs/common/services/console-logger.service';
import {
  isString,
  isUndefined,
} from '@nestjs/common/utils/shared.utils';
import { RxapLogger } from '@rxap/nest-logger';

@Injectable()
export class SentryLogger extends RxapLogger {

  @Inject(CONSOLE_LOGGER_OPTIONS)
  protected override readonly options!: ConsoleLoggerOptions;

  @Inject(SENTRY_MODULE_OPTIONS)
  private readonly sentryOptions!: SentryModuleOptions;

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
    if (!this.sentryOptions.dsn) {
      return;
    }
    if (this.sentryOptions.logLevels && !this.sentryOptions.logLevels.includes('log')) {
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
        }) :
        Sentry.captureMessage(message, {
          level: 'log',
          extra: { context },
        });
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
    if (!this.sentryOptions.dsn) {
      return;
    }
    if (this.sentryOptions.logLevels && !this.sentryOptions.logLevels.includes('error')) {
      return;
    }
    try {
      Sentry.captureMessage(message, {
        level: 'error',
        extra: {
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
    if (!this.sentryOptions.dsn) {
      return;
    }
    if (this.sentryOptions.logLevels && !this.sentryOptions.logLevels.includes('warn')) {
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
        Sentry.captureMessage(message, {
          level: 'warning',
          extra: { context },
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
    if (!this.sentryOptions.dsn) {
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
        Sentry.captureMessage(message, {
          level: 'debug',
          extra: { context },
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
