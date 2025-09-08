import { LogLevel } from '@nestjs/common';

export function GetLogLevels(): LogLevel[] {
  const logLevels: LogLevel[] = [];

  switch (process.env['LOG_LEVEL']?.toLowerCase()) {

    case 'verbose':
      logLevels.push('verbose');
      logLevels.push('debug');
      logLevels.push('log');
      logLevels.push('warn');
      logLevels.push('error');
      logLevels.push('fatal');
      break;

    case 'debug':
      logLevels.push('debug');
      logLevels.push('log');
      logLevels.push('warn');
      logLevels.push('error');
      logLevels.push('fatal');
      break;

    case 'log':
      logLevels.push('log');
      logLevels.push('warn');
      logLevels.push('error');
      logLevels.push('fatal');
      break;

    default:
    case 'warn':
      logLevels.push('warn');
      logLevels.push('error');
      logLevels.push('fatal');
      break;

    case 'error':
      logLevels.push('error');
      logLevels.push('fatal');
      break;

    case 'fatal':
      logLevels.push('fatal');
      break;

  }

  console.debug('LogLevels:', logLevels.join(', '));

  return logLevels;
}
