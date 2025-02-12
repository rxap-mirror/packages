import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';

/**
 * Generates a Joi validation schema for Auth0 configuration values based on the provided environment.
 *
 * @param environment - The environment parameters that may influence the validation schema.
 *
 * @returns A Joi schema map that defines validation rules for the following Auth0 configuration keys:
 * - `AUTH0_ISSUER_URL`: Must be a string.
 * - `AUTH0_AUDIENCE`: Must be a string.
 * - `AUTH0_DOMAIN`: Must be a string and a valid domain.
 * - `AUTH0_CLIENT_ID`: Must be a string.
 * - `AUTH0_CLIENT_SECRET`: Must be a string.
 *
 * @example
 * ```typescript
 * const schema = auth0ValidationSchema(environment);
 */
export function auth0ValidationSchema(environment: Environment) {

  const schema: SchemaMap = {};

  schema['AUTH0_ISSUER_URL'] = Joi.string();
  schema['AUTH0_AUDIENCE'] = Joi.string();

  schema['AUTH0_DOMAIN'] = Joi.string().domain();
  schema['AUTH0_CLIENT_ID'] = Joi.string();
  schema['AUTH0_CLIENT_SECRET'] = Joi.string();

  return schema;

}
