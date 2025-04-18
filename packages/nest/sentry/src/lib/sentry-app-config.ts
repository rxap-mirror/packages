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
    serverName = process.env['ROOT_DOMAIN'] ?? environment.app,
    release,
    environment: environmentName,
    enabled = environment.sentry?.enabled ?? false,
    dsn
  }: Partial<SentryConfig> = {}
): SchemaMap {
  const schema: SchemaMap = {};

  schema['SENTRY_DEBUG'] = Joi.string().default(debug);
  schema['SENTRY_SERVER_NAME'] = Joi.string().default(serverName);

  let releaseConfig = Joi.string();
  if (release) {
    releaseConfig = releaseConfig.default(release);
  }
  schema['SENTRY_RELEASE'] = releaseConfig;

  let environmentConfig = Joi.string();
  if (environmentName) {
    environmentConfig = environmentConfig.default(environmentName);
  }
  schema['SENTRY_ENVIRONMENT'] = environmentConfig;

  schema['SENTRY_ENABLED'] = Joi.string().default(enabled);

  let dsnConfig = Joi.string();
  if (dsn) {
    dsnConfig = dsnConfig.default(dsn);
  }
  schema['SENTRY_DSN'] = dsnConfig;

  return schema;
}
