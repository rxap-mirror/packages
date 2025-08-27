import { INestApplication } from '@nestjs/common';
import type {
  CorsOptions,
  CorsOptionsDelegate,
} from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';
import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';


export interface SetupCorsOptions {
  corsOptions?: CorsOptions | CorsOptionsDelegate<any>;
}

export function SetupCors({ corsOptions }: SetupCorsOptions = {}) {
  return (app: INestApplication, config: ConfigService) =>
    app.enableCors({
      credentials: config.get('CORS_CREDENTIALS', true),
      origin: config.get('CORS_ORIGIN', true),
      allowedHeaders: config.get('CORS_ALLOWED_HEADERS', ['sentry-trace', 'baggage']),
      exposedHeaders: config.get('CORS_EXPOSED_HEADERS'),
      methods: config.get('CORS_METHODS'),
      ...corsOptions,
    });
}

export function corsValidationSchema(
  environment: Environment,
  {
    origin = true,
    credentials = true,
  }: {
    origin?: any
    credentials?: boolean
  } = {}
) {

  const schema: SchemaMap = {};

  schema['CORS_ORIGIN'] = Joi.any().default(origin);
  schema['CORS_CREDENTIALS'] = Joi.boolean().default(credentials);
  schema['CORS_ALLOWED_HEADERS'] = Joi.array().items(Joi.string()).default(['sentry-trace', 'baggage']);
  schema['CORS_EXPOSED_HEADERS'] = Joi.array().items(Joi.string());
  schema['CORS_METHODS'] = Joi.array().items(Joi.string().valid('GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT'));

  return schema;

}
