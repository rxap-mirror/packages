import { Environment } from '@rxap/nest-utilities';
import { LogSeverityLevel } from '@sentry/core';
import type { SchemaMap } from 'joi';
import * as Joi from 'joi';

export function sentryValidationSchema(
  environment: Environment,
  {
    logLevel = 'warn',
    enabled = environment.sentry?.enabled ?? false,
  }: Partial<{ logLevel: LogSeverityLevel, enabled: boolean }> = {}
): SchemaMap {
  const schema: Record<string, Joi.StringSchema | Joi.BooleanSchema> = {};

  schema['SENTRY_LOG_LEVEL'] = Joi.string().allow('trace', 'debug', 'info', 'warn', 'error', 'fatal').default(logLevel);
  schema['SENTRY_ENABLED'] = Joi.boolean().default(enabled);

  return schema;
}
