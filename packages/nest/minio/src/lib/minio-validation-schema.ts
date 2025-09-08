import { Environment } from '@rxap/nest-utilities';
import { SchemaMap } from 'joi';
import * as Joi from 'joi';

export function minioValidationSchema(environment: Environment, {
  endPoint = 'minio',
  useSSL = endPoint !== 'minio',
  accessKey = 'minioadmin',
  secretKey = 'minioadmin',
  port = useSSL ? 443 : 9000,
}: {
  endPoint?: string;
  port?: number;
  useSSL?: boolean;
  accessKey?: string;
  secretKey?: string;
} = {}) {

  const schema: SchemaMap = {};

  schema['MINIO_END_POINT'] = Joi.string().default(endPoint);
  schema['MINIO_PORT'] = Joi.number().default(port);
  schema['MINIO_USE_SSL'] = Joi.boolean().default(useSSL);
  schema['MINIO_ACCESS_KEY'] = Joi.string().default(accessKey);
  schema['MINIO_SECRET_KEY'] = Joi.string().default(secretKey);

  return schema;
}
