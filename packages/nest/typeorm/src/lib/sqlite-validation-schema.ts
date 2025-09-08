import { SchemaMap } from 'joi';
import * as Joi from 'joi';
import { Environment } from '@rxap/nest-utilities';

export const sqliteValidationSchema: (environment: Environment) => SchemaMap = (environment: Environment) => {
  return {
    SQLITE_DATABASE: Joi.string().default('database.sqlite'),
  };
};
