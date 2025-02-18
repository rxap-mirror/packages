import { Environment } from '@rxap/nest-utilities';
import { SchemaMap } from 'joi';
import * as Joi from 'joi';

export function keyvMinioValidationSchema(environment: Environment) {

  const schema: SchemaMap = {};

  schema['KEYV_MINIO_END_POINT'] = Joi.string().default('minio');
  schema['KEYV_MINIO_PORT'] = Joi.number().default(9000);
  schema['KEYV_MINIO_USE_SSL'] = Joi.boolean().default(false);
  schema['KEYV_MINIO_ACCESS_KEY'] = Joi.string().default('minioadmin');
  schema['KEYV_MINIO_SECRET_KEY'] = Joi.string().default('minioadmin');
  schema['KEYV_MINIO_BUCKET_NAME'] = Joi.string().default('keyv');
  schema['KEYV_MINIO_PATH_PREFIX'] = Joi.string().default(environment.app);

  return schema;
}
