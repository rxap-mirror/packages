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
      break;

    case 'debug':
      logLevels.push('debug');
      logLevels.push('log');
      logLevels.push('warn');
      logLevels.push('error');
      break;

    case 'log':
      logLevels.push('log');
      logLevels.push('warn');
      logLevels.push('error');
      break;

    default:
    case 'warn':
      logLevels.push('warn');
      logLevels.push('error');
      break;

    case 'error':
      logLevels.push('error');
      break;

  }

  console.debug('LogLevels:', logLevels.join(', '));

  return logLevels;
}
