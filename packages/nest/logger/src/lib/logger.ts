import {
  ConsoleLogger,
  ConsoleLoggerOptions,
  Inject,
  Injectable,
  LogLevel,
  Optional,
} from '@nestjs/common';
import {
  CONSOLE_LOGGER_OPTIONS,
  RXAP_LOGGER_FORMAT_MESSAGE,
  RXAP_LOGGER_PRINT_MESSAGES,
} from './tokens';

/**
 * @return true - call the super.printMessages method
 */
export type PrintMessagesFunction = (
  messages: unknown[],
  context: string,
  logLevel: LogLevel,
  writeStreamType?: 'stdout' | 'stderr',
) => boolean;

export type FormatMessageFunction = (
  pidMessage: string,
  timestamp: string,
  formattedLogLevel: string,
  contextMessage: string,
  output: string,
  timestampDiff: string,
) => string;

/**
 * A custom logger class that extends the ConsoleLogger class.
 * This class provides additional methods for logging at different log levels and supports the interpolation of optional parameters.
 */
@Injectable()
export class RxapLogger extends ConsoleLogger {

  @Optional()
  @Inject(RXAP_LOGGER_PRINT_MESSAGES)
  protected readonly printMessagesFunction: PrintMessagesFunction | null = null;

  @Optional()
  @Inject(RXAP_LOGGER_FORMAT_MESSAGE)
  protected readonly formatMessageFunction: FormatMessageFunction | null = null;

  constructor(
    @Optional()
    context?: string,
    @Inject(CONSOLE_LOGGER_OPTIONS)
    @Optional()
    options: ConsoleLoggerOptions = {},
  ) {
    super(context as any, options);
  }

  protected interpolate(messages: unknown[]): unknown[] {
    if (messages.length <= 1) {
      return messages;
    }
    if (typeof messages[0] !== 'string') {
      return messages;
    }
    if (!(messages[0] as string).includes('%JSON')) {
      return messages;
    }
    let message = messages.shift() as string;
    message = message.replace(/%JSON/g, () => {
      if (messages.length) {
        const param = messages.shift();
        if (typeof param === 'object') {
          if (param) {
            return this.stringifyCircular(param);
          } else if (param === null) {
            return '<null>';
          }
        }
        if (typeof param === 'undefined') {
          return '<undefined>';
        }
        if (typeof param === 'string') {
          return JSON.stringify(param);
        }
        if (typeof param === 'number') {
          return JSON.stringify(param);
        }
        if (typeof param === 'boolean') {
          return JSON.stringify(param);
        }
        messages.unshift(param);
      }
      return '<json>';
    });
    return [message, ...messages];
  }

  protected stringifyCircular(obj: any) {
    const seenObjects = new Set();

    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seenObjects.has(value)) {
          // Detected a circular reference, replace it with a custom string or value
          return '[Circular]';
        }
        seenObjects.add(value);
      }
      return value;
    });
  }

  protected override formatMessage(
    logLevel: LogLevel,
    message: unknown,
    pidMessage: string,
    formattedLogLevel: string,
    contextMessage: string,
    timestampDiff: string,
  ) {
    const output = this.stringifyMessage(message, logLevel);
    pidMessage = this.colorize(pidMessage, logLevel);
    formattedLogLevel = this.colorize(formattedLogLevel, logLevel);
    if (this.formatMessageFunction) {
      return this.formatMessageFunction(pidMessage, this.getTimestamp(), formattedLogLevel, contextMessage, output, timestampDiff);
    }
    return `${pidMessage}${this.getTimestamp()} ${formattedLogLevel} ${contextMessage}${output}${timestampDiff}\n`;
  }

  protected override printMessages(
    messages: unknown[],
    context = '',
    logLevel: LogLevel = 'log',
    writeStreamType?: 'stdout' | 'stderr',
  ) {
    if (this.printMessagesFunction) {
      const call = this.printMessagesFunction(messages, context, logLevel, writeStreamType);
      if (call) {
        super.printMessages(this.interpolate(messages), context, logLevel, writeStreamType);
      }
    } else {
      super.printMessages(this.interpolate(messages), context, logLevel, writeStreamType);
    }
  }

}
