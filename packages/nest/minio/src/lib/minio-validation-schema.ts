import { Environment } from '@rxap/nest-utilities';
import { SchemaMap } from 'joi';
import * as Joi from 'joi';

export function minioValidationSchema(environment: Environment) {

  const schema: SchemaMap = {};

  schema['MINIO_END_POINT'] = Joi.string().default('minio');
  schema['MINIO_PORT'] = Joi.number().default(9000);
  schema['MINIO_USE_SSL'] = Joi.boolean().default(false);
  schema['MINIO_ACCESS_KEY'] = Joi.string().default('minioadmin');
  schema['MINIO_SECRET_KEY'] = Joi.string().default('minioadmin');

  return schema;
}
