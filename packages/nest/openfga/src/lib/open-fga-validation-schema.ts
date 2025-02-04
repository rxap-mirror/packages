import { Environment } from '@rxap/nest-utilities';
import { SchemaMap } from 'joi';
import * as Joi from 'joi';

export function openFgaValidationSchema(environment: Environment) {

  const schema: SchemaMap = {};

  schema['FGA_API_URL'] = Joi.string().uri().default('http://localhost:8080');
  schema['FGA_STORE_ID'] = Joi.string();
  schema['FGA_AUTHORIZATION_MODEL_ID'] = Joi.string();
  schema['FGA_API_TOKEN'] = Joi.string();

  return schema;
}
