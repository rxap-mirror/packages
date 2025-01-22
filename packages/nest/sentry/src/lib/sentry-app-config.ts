import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';
import type { SchemaMap } from 'joi';

export function sentryValidationSchema(environment: Environment): SchemaMap {
  const schema: SchemaMap = {};

  schema['SENTRY_DEBUG'] = Joi.string().default(
    environment.sentry?.debug ?? false
  );

  schema['SENTRY_SERVER_NAME'] = Joi.string().default(
    process.env['ROOT_DOMAIN'] ?? environment.app
  );
  schema['SENTRY_RELEASE'] = Joi.string();
  schema['SENTRY_ENVIRONMENT'] = Joi.string();
  schema['SENTRY_ENABLED'] = Joi.string().default(
    environment.sentry?.enabled ?? false
  );
  schema['SENTRY_DSN'] = Joi.string();

  return schema;
}
