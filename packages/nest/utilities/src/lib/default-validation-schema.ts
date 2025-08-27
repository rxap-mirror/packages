import { Environment } from '@rxap/nest-utilities';
import { GenerateRandomString } from '@rxap/utilities';
import * as Joi from 'joi';
import type { SchemaMap } from 'joi';

export function defaultValidationSchema(
  environment: Environment,
  {
    cookieSecret = GenerateRandomString(),
    throttlerLimit = 10,
    throttlerTTL = 1,
  }: {
    cookieSecret?: string,
    throttlerLimit?: number,
    throttlerTTL?: number,
  } = {}
  ): SchemaMap {

  const schema: SchemaMap = {};

  schema['COOKIE_SECRET'] = Joi.string().default(cookieSecret);
  schema['THROTTLER_LIMIT'] = Joi.string().default(throttlerLimit);
  schema['THROTTLER_TTL'] = Joi.string().default(throttlerTTL);

  return schema;

}
