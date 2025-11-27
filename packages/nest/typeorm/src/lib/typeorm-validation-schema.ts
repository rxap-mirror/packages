import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import { MixedList } from 'typeorm/common/MixedList';
import { postgresValidationSchema } from './postgres-validation-schema';
import { sqliteValidationSchema } from './sqlite-validation-schema';

export function typeOrmValidationSchema(
  environment: Environment,
  {
    synchronize = !environment.production,
    migrationsRun = false,
    logging = process.env['LOG_LEVEL'] === 'verbose',
    migrationsTableName,
    migrationsTransactionMode,
    type = 'sqlite',
    migrations,
  }: {
    synchronize?: boolean,
    migrationsRun?: boolean,
    migrationsTableName?: string,
    logging?: boolean,
    type?: string,
    migrationsTransactionMode?: 'all' | 'none' | 'each',
    migrations?: string,
  } = {}
): SchemaMap {
  const schema = {
    ...postgresValidationSchema(environment),
    ...sqliteValidationSchema(environment),
    TYPEORM_TYPE: Joi.string().default(type),
    TYPEORM_SYNCHRONIZE: Joi.boolean().default(synchronize),
    TYPEORM_LOGGING: Joi.boolean().default(logging),
    TYPEORM_MIGRATIONS_RUN: Joi.boolean(),
    TYPEORM_MIGRATION_TABLE_NAME: Joi.string(),
    TYPEORM_MIGRATIONS_TRANSACTION_MODE: Joi.string(),
    TYPEORM_MIGRATIONS: Joi.string(),
  };

  if (migrationsRun) {
    schema.TYPEORM_MIGRATIONS_RUN = schema.TYPEORM_MIGRATIONS_RUN.default(migrationsRun);
  }

  if (migrationsTableName) {
    schema.TYPEORM_MIGRATION_TABLE_NAME = schema.TYPEORM_MIGRATION_TABLE_NAME.default(migrationsTableName);
  }

  if (migrationsTransactionMode) {
    schema.TYPEORM_MIGRATIONS_TRANSACTION_MODE = schema
      .TYPEORM_MIGRATIONS_TRANSACTION_MODE.default(migrationsTransactionMode);
  }

  if (migrations) {
    schema.TYPEORM_MIGRATIONS = schema.TYPEORM_MIGRATIONS.default(migrations);
  }

  return schema;
}
