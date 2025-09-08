import { SchemaMap } from 'joi';
import * as Joi from 'joi';
import { Environment } from '@rxap/nest-utilities';

export const postgresValidationSchema: (
  environment: Environment
) => SchemaMap = (environment: Environment) => {
  return {
    POSTGRES_HOST: Joi.string().default('localhost'),
    POSTGRES_PORT: Joi.number().default(5432),
    POSTGRES_USER: Joi.string().default('postgres'),
    POSTGRES_PASSWORD: Joi.string().default('postgres'),
    POSTGRES_DB: Joi.string().default('postgres'),
    POSTGRES_URL: Joi.string(),
  };
};
