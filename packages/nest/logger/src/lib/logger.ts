import {
  ConsoleLogger,
  ConsoleLoggerOptions,
  Inject,
  Injectable,
  LogLevel,
  Optional,
} from '@nestjs/common';
import { CONSOLE_LOGGER_OPTIONS } from './tokens';

/**
 * A custom logger class that extends the ConsoleLogger class.
 * This class provides additional methods for logging at different log levels and supports the interpolation of optional parameters.
 */
@Injectable()
export class RxapLogger extends ConsoleLogger {

  constructor(
    @Optional()
    context?: string,
    @Inject(CONSOLE_LOGGER_OPTIONS)
    @Optional()
    options: ConsoleLoggerOptions = {},
  ) {
    super(context as any, options);
  }

  override log(message: string, ...optionalParams: any[]) {
    const {
      msg,
      params,
    } = this.interpolate(message, optionalParams, 'log');
    super.log(msg, ...params);
  }

  override error(message: string, ...optionalParams: any[]) {
    const {
      msg,
      params,
    } = this.interpolate(message, optionalParams, 'error');
    super.error(msg, ...params);
  }

  override warn(message: string, ...optionalParams: any[]) {
    const {
      msg,
      params,
    } = this.interpolate(message, optionalParams, 'warn');
    super.warn(msg, ...params);
  }

  override debug(message: string, ...optionalParams: any[]) {
    const {
      msg,
      params,
    } = this.interpolate(message, optionalParams, 'debug');
    super.debug(msg, ...params);
  }

  override verbose(message: string, ...optionalParams: any[]) {
    const {
      msg,
      params,
    } = this.interpolate(message, optionalParams, 'verbose');
    super.verbose(msg, ...params);
  }

  protected interpolate(message: unknown, optionalParams: any[], logLevel: LogLevel): { msg: unknown, params: any[] } {
    if (this.isLevelEnabled(logLevel) && typeof message === 'string') {
      if (message.includes('%JSON')) {
        // replace each %JSON with the corresponding optionalParam
        const msg = message.replace(/%JSON/g, () => {
          if (optionalParams.length) {
            const param = optionalParams.shift();
            if (typeof param === 'object') {
              if (param) {
                return this.stringifyCircular(param);
              } else if (param === null) {
                return '<null>';
              } else {
                return '<undefined>';
              }
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
            optionalParams.unshift(param);
          }
          return '<json>';
        });
        return {
          msg,
          params: optionalParams,
        };
      }
    }
    return {
      msg: message,
      params: optionalParams,
    };
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

}
