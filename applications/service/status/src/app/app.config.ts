import { GenerateRandomString } from '@rxap/utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import { environment } from '../environments/environment';

const validationSchema: SchemaMap = {};
validationSchema['COOKIE_SECRET'] = Joi.string().default(GenerateRandomString());
validationSchema['THROTTLER_LIMIT'] = Joi.string().default(10);
validationSchema['THROTTLER_TTL'] = Joi.string().default(1);
validationSchema['GLOBAL_API_PREFIX'] = Joi.string().default('api/status');
validationSchema['PORT'] = Joi.number().default(6230);
validationSchema['SENTRY_DEBUG'] = Joi.string().default(environment.sentry?.debug ?? false);
validationSchema['SENTRY_SERVER_NAME'] = Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-status');
validationSchema['SENTRY_RELEASE'] = Joi.string();
validationSchema['SENTRY_ENVIRONMENT'] = Joi.string();
validationSchema['SENTRY_ENABLED'] = Joi.string().default(environment.sentry?.enabled ?? false);
validationSchema['SENTRY_DSN'] = Joi.string();
validationSchema['STORE_FILE_PATH'] =
  Joi.string().default(environment.production ? '/data' : '/tmp/rxap/packages/service/status');
export const VALIDATION_SCHEMA = Joi.object(validationSchema);
