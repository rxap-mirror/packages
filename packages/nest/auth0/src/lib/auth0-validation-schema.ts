import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';
import {
  AnySchema,
  StringSchema,
} from 'joi';

/**
 * Auth0ValidationSchema defines the structure for environment variables
 * used in configuring and validating Auth0 authentication.
 *
 * This interface specifies the required properties needed for integrating
 * Auth0, including URLs, audience, domain, client ID, and client secret.
 *
 * Properties:
 * - AUTH0_ISSUER_URL: The URL representing the Auth0 issuer, typically used
 *   for validating tokens and identifying the authorization server.
 * - AUTH0_AUDIENCE: The unique identifier representing the API audience
 *   that tokens will be issued for.
 * - AUTH0_DOMAIN: The domain of the Auth0 tenant, used for constructing
 *   URLs and making Auth0 API calls.
 * - AUTH0_CLIENT_ID: The client identifier for the application, provided
 *   by Auth0 during application registration.
 * - AUTH0_CLIENT_SECRET: The secret key associated with the application,
 *   used for validating communication and securing requests.
 */
export interface Auth0ValidationSchema {
  AUTH0_ISSUER_URL: string,
  AUTH0_AUDIENCE: string,
  AUTH0_DOMAIN: string,
  AUTH0_CLIENT_ID: string,
  AUTH0_CLIENT_SECRET: string,
  AUTH0_MANAGEMENT_TOKEN: string,
  AUTH0_DISABLED: boolean,
}

/**
 * Generates a validation schema for Auth0 configuration settings using Joi.
 * This schema can be used to validate environment-specific variables.
 *
 * @param {Environment} environment - The application's environment configuration used to determine the applicable validation schema.
 * @param {Partial<Auth0ValidationSchema>} [defaults={}] - An optional object with default values for the schema keys.
 * @return {Record<string, StringSchema>} The Joi validation schema object for Auth0 configuration.
 */
export function auth0ValidationSchema(environment: Environment, defaults: Partial<Auth0ValidationSchema> = {}) {

  const schema: Record<string, AnySchema> = {};

  schema['AUTH0_ISSUER_URL'] = Joi.string();
  schema['AUTH0_AUDIENCE'] = Joi.string();

  schema['AUTH0_DOMAIN'] = Joi.string().domain();
  schema['AUTH0_CLIENT_ID'] = Joi.string();
  schema['AUTH0_CLIENT_SECRET'] = Joi.string();

  schema['AUTH0_MANAGEMENT_TOKEN'] = Joi.string();
  schema['AUTH0_DISABLED'] = Joi.boolean();

  for (const [ key, value ] of Object.keys(defaults)) {
    if (value) {
      schema[key] = schema[key].default(value);
    }
  }

  return schema;

}
