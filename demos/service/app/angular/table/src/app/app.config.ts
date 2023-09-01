import { GenerateRandomString } from '@rxap/utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import * as process from 'process';
import { environment } from '../environments/environment';

const validationSchema: SchemaMap = {};
validationSchema['COOKIE_SECRET'] = Joi.string().default(GenerateRandomString());
validationSchema['THROTTLER_LIMIT'] = Joi.string().default(10);
validationSchema['THROTTLER_TTL'] = Joi.string().default(60);
validationSchema['GLOBAL_API_PREFIX'] = Joi.string().default('api/app/angular/table');
validationSchema['PORT'] = Joi.number().default(3613);
validationSchema['SENTRY_DEBUG'] = Joi.string().default(environment.sentry?.debug ?? false);
validationSchema['SENTRY_SERVER_NAME'] = Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-app-angular-table');
validationSchema['SENTRY_RELEASE'] = Joi.string();
validationSchema['SENTRY_ENVIRONMENT'] = Joi.string();
validationSchema['SENTRY_ENABLED'] = Joi.string().default(environment.sentry?.enabled ?? false);
validationSchema['SENTRY_DSN'] = Joi.string();
validationSchema['STATUS_SERVICE_BASE_URL'] = Joi.string()
                                                 .default(environment.production ?
                                                   'http://status-service:3000' :
                                                   `https://${ process.env.ROOT_DOMAIN ?? 'localhost' }:8443`);
export const VALIDATION_SCHEMA = Joi.object(validationSchema);
