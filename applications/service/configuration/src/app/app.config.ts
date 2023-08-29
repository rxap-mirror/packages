import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import { join } from 'path';
import { environment } from '../environments/environment';

const validationSchema: SchemaMap = {};

validationSchema['PORT'] = Joi.number().default(3309);
validationSchema['GLOBAL_API_PREFIX'] = Joi.string().default('api/configuration');
validationSchema['SENTRY_DSN'] = Joi.string();
validationSchema['SENTRY_ENABLED'] = Joi.string().default(environment.sentry?.enabled ?? false);
validationSchema['SENTRY_ENVIRONMENT'] = Joi.string();
validationSchema['SENTRY_RELEASE'] = Joi.string();
validationSchema['SENTRY_SERVER_NAME'] = Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-configuration');
validationSchema['SENTRY_DEBUG'] = Joi.string().default(environment.sentry?.debug ?? false);
validationSchema['DATA_DIR'] = Joi.string().default(environment.production ? '/app/assets' : join(__dirname, 'assets'));

export const VALIDATION_SCHEMA = Joi.object(validationSchema);
