import { GenerateRandomString } from '@rxap/utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import { join } from 'path';
import * as process from 'process';
import { environment } from '../environments/environment';

const validationSchema: SchemaMap = {};
validationSchema['STATUS_SERVICE_BASE_URL'] =
  Joi.string().default(environment.production ? 'http://rxap-service-status:3000' : 'http://localhost:5300');
validationSchema['COOKIE_SECRET'] = Joi.string().default(GenerateRandomString());
validationSchema['THROTTLER_LIMIT'] = Joi.string().default(10);
validationSchema['THROTTLER_TTL'] = Joi.string().default(1);
validationSchema['GLOBAL_API_PREFIX'] = Joi.string().default('api/changelog');
validationSchema['PORT'] = Joi.number().default(3218);
validationSchema['SENTRY_DEBUG'] = Joi.string().default(environment.sentry?.debug ?? false);
validationSchema['SENTRY_SERVER_NAME'] = Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-changelog');
validationSchema['SENTRY_RELEASE'] = Joi.string();
validationSchema['SENTRY_ENVIRONMENT'] = Joi.string();
validationSchema['SENTRY_ENABLED'] = Joi.string().default(environment.sentry?.enabled ?? false);
validationSchema['SENTRY_DSN'] = Joi.string();
validationSchema['DATA_DIR'] = Joi.string().default(environment.production ? '/app/assets' : join(__dirname, 'assets'));
export const VALIDATION_SCHEMA = Joi.object(validationSchema);
