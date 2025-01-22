import { Environment } from '@rxap/nest-utilities';
import { GenerateRandomString } from '@rxap/utilities';
import * as Joi from 'joi';
import type { SchemaMap } from 'joi';

export function defaultValidationSchema(environment: Environment): SchemaMap {

  const schema: SchemaMap = {};

  schema['COOKIE_SECRET'] = Joi.string().default(
    GenerateRandomString()
  );
  schema['THROTTLER_LIMIT'] = Joi.string().default(10);
  schema['THROTTLER_TTL'] = Joi.string().default(1);
  schema['GLOBAL_API_PREFIX'] = Joi.string().default(
    'api'
  );
  schema['PORT'] = Joi.number().default(3183);

  return schema;

}
