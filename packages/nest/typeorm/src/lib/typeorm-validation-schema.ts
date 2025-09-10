import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import { postgresValidationSchema } from './postgres-validation-schema';
import { sqliteValidationSchema } from './sqlite-validation-schema';

export function typeOrmValidationSchema(
  environment: Environment,
  {
    synchronize = !environment.production,
    logging = process.env['LOG_LEVEL'] === 'verbose',
    type = 'sqlite',
  }: {
    synchronize?: boolean,
    logging?: boolean,
    type?: string,
  } = {}
): SchemaMap {
  return {
    ...postgresValidationSchema(environment),
    ...sqliteValidationSchema(environment),
    TYPEORM_TYPE: Joi.string().default(type),
    TYPEORM_SYNCHRONIZE: Joi.boolean().default(synchronize),
    TYPEORM_LOGGING: Joi.boolean().default(logging),
  };
}
