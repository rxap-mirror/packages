import { SchemaMap } from 'joi';
import * as Joi from 'joi';
import { Environment } from '@rxap/nest-utilities';
import { postgresValidationSchema } from './postgres-validation-schema';
import { sqliteValidationSchema } from './sqlite-validation-schema';

export const typeOrmValidationSchema: (environment: Environment) => SchemaMap = (environment: Environment) => {
  return {
    ...postgresValidationSchema(environment),
    ...sqliteValidationSchema(environment),
    TYPEORM_TYPE: Joi.string().default('sqlite'),
    TYPEORM_SYNCHRONIZE: Joi.boolean().default(!environment.production),
    TYPEORM_LOGGING: Joi.boolean().default(process.env['LOG_LEVEL'] === 'verbose'),
  };
};
