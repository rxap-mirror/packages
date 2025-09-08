import { LogSeverityLevel } from '@sentry/core';

export function GetSentryLogLevels(sentryLogLevel = process.env['SENTRY_LOG_LEVEL']): LogSeverityLevel[] {
  const logLevels: LogSeverityLevel[] = [];

  switch (sentryLogLevel?.toLowerCase()) {

    case 'verbose':
    case 'trace':
      logLevels.push('trace');
      logLevels.push('debug');
      logLevels.push('info');
      logLevels.push('warn');
      logLevels.push('error');
      logLevels.push('fatal');
      break;

    case 'debug':
      logLevels.push('debug');
      logLevels.push('info');
      logLevels.push('warn');
      logLevels.push('error');
      logLevels.push('fatal');
      break;

    case 'log':
    case 'info':
      logLevels.push('info');
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

  console.debug('SentryLogLevels:', logLevels.join(', '));

  return logLevels;
}
