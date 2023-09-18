import { GenerateRandomString } from '@rxap/utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import { join } from 'path';
import * as process from 'process';
import { environment } from '../environments/environment';

const validationSchema: SchemaMap = {};

validationSchema['PORT'] = Joi.number().default(3888);
validationSchema['GLOBAL_API_PREFIX'] = Joi.string().default('api/configuration');
validationSchema['SENTRY_DSN'] = Joi.string();
validationSchema['SENTRY_ENABLED'] = Joi.string().default(environment.sentry?.enabled ?? false);
validationSchema['SENTRY_ENVIRONMENT'] = Joi.string();
validationSchema['SENTRY_RELEASE'] = Joi.string();
validationSchema['SENTRY_SERVER_NAME'] = Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-configuration');
validationSchema['SENTRY_DEBUG'] = Joi.string().default(environment.sentry?.debug ?? false);
validationSchema['DATA_DIR'] = Joi.string().default(environment.production ? '/app/assets' : join(__dirname, 'assets'));
validationSchema['THROTTLER_LIMIT'] = Joi.string().default(10);
validationSchema['THROTTLER_TTL'] = Joi.string().default(1);
validationSchema['COOKIE_SECRET'] = Joi.string().default(GenerateRandomString());
validationSchema['STATUS_SERVICE_BASE_URL'] = Joi.string()
                                                 .default(environment.production ?
                                                   'http://rxap-service-status:3000' :
                                                   'http://localhost:5300');

export const VALIDATION_SCHEMA = Joi.object(validationSchema);
