import { ConsoleLoggerOptions } from '@nestjs/common';
import { LogSeverityLevel } from '@sentry/core';

export type SentryModuleOptions = {
  logLevels: LogSeverityLevel[],
  logger?: ConsoleLoggerOptions,
  enabled?: boolean,
};
