import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';

export function serverValidationSchema(
  environment: Environment,
  {
    apiPort = environment.production ? 443 : undefined,
    apiUrl,
    apiBaseUrl,
    apiProtocol = environment.production ? 'https' : 'http',
    apiDomain,
    globalApiPrefix = 'api',
    environmentTier = environment.tier ?? 'development',
    logLevel = environment.production ? 'log' : 'verbose',
  }: {
    apiPort?: number;
    apiUrl?: string;
    apiBaseUrl?: string;
    apiProtocol?: 'http' | 'https'
    apiDomain?: string;
    globalApiPrefix?: string;
    environmentTier?: string;
    logLevel?: 'verbose' | 'debug' | 'log' | 'warn' | 'error';
  } = {}
) {
  const schema: SchemaMap = {};

  schema['PORT'] = Joi.number().port();
  schema['GLOBAL_API_PREFIX'] = Joi.string().default(globalApiPrefix);
  schema['ENVIRONMENT'] = Joi.string().default(environmentTier);
  schema['LOG_LEVEL'] = Joi.string().valid('verbose', 'debug', 'log', 'warn', 'error').default(logLevel);

  schema['API_PORT'] = Joi.number().port();
  if (apiPort) {
    schema['API_PORT'] = Joi.number().port().default(apiPort);
  }

  schema['ROOT_DOMAIN_PORT'] = Joi.number().port();
  schema['ROOT_DOMAIN'] = Joi.string().domain({
    allowFullyQualified: false,
    allowUnicode: false,
    tlds: !environment.production ? { allow: false } : undefined,
  });

  schema['API_URL'] = Joi.string().uri();
  if (apiUrl) {
    schema['API_URL'] = Joi.string().uri().default(apiUrl);
  }

  schema['API_BASE_URL'] = Joi.string().uri();
  if (apiUrl) {
    schema['API_BASE_URL'] = Joi.string().uri().default(apiBaseUrl);
  }

  schema['API_PROTOCOL'] = Joi.string().valid('http', 'https');
  if (apiProtocol) {
    schema['API_PROTOCOL'] = Joi.string().valid('http', 'https').default(apiProtocol);
  }

  schema['API_DOMAIN'] = Joi.string().domain({
    allowFullyQualified: false,
    allowUnicode: false,
    tlds: !environment.production ? { allow: false } : undefined,
  });
  if (apiDomain) {
    schema['API_DOMAIN'] = Joi.string().domain({
      allowFullyQualified: false,
      allowUnicode: false,
      tlds: !environment.production ? { allow: false } : undefined,
    }).default(apiDomain);
  }

  return schema;
}
