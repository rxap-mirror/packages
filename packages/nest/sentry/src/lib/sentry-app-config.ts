import { Environment } from '@rxap/nest-utilities';
import { LogSeverityLevel } from '@sentry/core';
import type { SchemaMap } from 'joi';
import * as Joi from 'joi';

export function sentryValidationSchema(
  environment: Environment,
  {
    logLevel = 'warn'
  }: Partial<{ logLevel: LogSeverityLevel }> = {}
): SchemaMap {
  const schema: Record<string, Joi.StringSchema> = {};

  schema['SENTRY_LOG_LEVEL'] = Joi.string().allow('trace', 'debug', 'info', 'warn', 'error', 'fatal').default(logLevel);

  return schema;
}
