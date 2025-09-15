import {
  INestApplication,
  Logger,
} from '@nestjs/common';
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
  return (app: INestApplication, config: ConfigService, logger: Logger) => {
    let origin: any = config.getOrThrow<string | boolean>('CORS_ORIGIN');
    if (typeof origin === 'string') {
      origin = origin.split(',').map(item => item.trim())
        .map(item => item.startsWith('/') && item.endsWith('/') ? new RegExp(item) : item);
    }
    const options = {
      credentials: config.getOrThrow('CORS_CREDENTIALS'),
      origin,
      allowedHeaders: config.getOrThrow('CORS_ALLOWED_HEADERS', [ 'sentry-trace', 'baggage' ]).split(','),
      exposedHeaders: config.getOrThrow('CORS_EXPOSED_HEADERS').split(','),
      methods: config.getOrThrow('CORS_METHODS').split(','),
      ...corsOptions,
    };
    logger.debug(`Enable cors with options: %JSON`, options, 'Bootstrap::SetupCors');
    app.enableCors(options);
  };
}

export function corsValidationSchema(
  environment: Environment,
  {
    origin = true,
    credentials = true,
    methods = [ 'GET', 'PUT', 'POST', 'DELETE' ],
    allowedHeaders = [ 'sentry-trace', 'baggage' ],
    exposedHeaders = []
  }: {
    origin?: string | boolean,
    credentials?: boolean,
    methods?: string[],
    allowedHeaders?: string[],
    exposedHeaders?: string[]
  } = {}
) {

  const schema: SchemaMap = {};

  schema['CORS_ORIGIN'] = Joi.allow(Joi.string(), Joi.boolean()).default(origin);
  schema['CORS_CREDENTIALS'] = Joi.boolean().default(credentials);
  schema['CORS_ALLOWED_HEADERS'] = Joi.string().default(allowedHeaders.join(','));
  schema['CORS_EXPOSED_HEADERS'] = Joi.string().default(exposedHeaders.join(','));
  schema['CORS_METHODS'] = Joi.string().default(methods.join(','));

  return schema;

}
