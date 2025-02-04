import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';

export function auth0ValidationSchema(environment: Environment) {

  const schema: SchemaMap = {};

  schema['AUTH0_ISSUER_URL'] = Joi.string();
  schema['AUTH0_AUDIENCE'] = Joi.string();

  schema['AUTH0_DOMAIN'] = Joi.string().domain();
  schema['AUTH0_CLIENT_ID'] = Joi.string();
  schema['AUTH0_CLIENT_SECRET'] = Joi.string();

  return schema;

}
