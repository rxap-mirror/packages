import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';
import type { SchemaMap } from 'joi';

export interface SentryConfig {
  debug: boolean;
  serverName: string;
  release: string;
  environment: string;
  enabled: boolean;
  dsn: string;
}

export function sentryValidationSchema(
  environment: Environment,
  {
    debug = environment.sentry?.debug ?? false,
    serverName = environment.sentry?.serverName ?? process.env['ROOT_DOMAIN'] ?? environment.app,
    release = environment.sentry?.release,
    environment: environmentName = environment.sentry?.environment,
    enabled = environment.sentry?.enabled ?? false,
    dsn = environment.sentry?.dsn,
  }: Partial<SentryConfig> = {}
): SchemaMap {
  const schema: Record<string, Joi.StringSchema> = {};

  schema['SENTRY_DEBUG'] = Joi.string().default(debug);
  schema['SENTRY_SERVER_NAME'] = Joi.string().default(serverName);
  schema['SENTRY_ENABLED'] = Joi.string().default(enabled);
  schema['SENTRY_RELEASE'] = Joi.string();
  if (release) {
    schema['SENTRY_RELEASE'] = schema['SENTRY_RELEASE'].default(release);
  }
  schema['SENTRY_ENVIRONMENT'] = Joi.string();
  if (environmentName) {
    schema['SENTRY_ENVIRONMENT'] = schema['SENTRY_ENVIRONMENT'].default(environmentName);
  }
  schema['SENTRY_DSN'] = Joi.string();
  if (dsn) {
    schema['SENTRY_DSN'] = schema['SENTRY_DSN'].default(dsn);
  }

  return schema;
}
