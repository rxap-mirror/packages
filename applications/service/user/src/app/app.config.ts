import { GenerateRandomString } from '@rxap/utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';
import { join } from 'path';
import * as process from 'process';
import { environment } from '../environments/environment';

const validationSchema: SchemaMap = {};
validationSchema['STATUS_SERVICE_BASE_URL'] = Joi.string()
                                                 .default(environment.production ?
                                                   'http://rxap-service-status:3000' :
                                                   'http://localhost:5300');
validationSchema['COOKIE_SECRET'] = Joi.string().default(GenerateRandomString());
validationSchema['THROTTLER_LIMIT'] = Joi.string().default(10);
validationSchema['THROTTLER_TTL'] = Joi.string().default(1);
validationSchema['GLOBAL_API_PREFIX'] = Joi.string().default('api/user');
validationSchema['PORT'] = Joi.number().default(6240);
validationSchema['SENTRY_DEBUG'] = Joi.string().default(environment.sentry?.debug ?? false);
validationSchema['SENTRY_SERVER_NAME'] = Joi.string().default(process.env.ROOT_DOMAIN ?? 'service-user');
validationSchema['SENTRY_RELEASE'] = Joi.string();
validationSchema['SENTRY_ENVIRONMENT'] = Joi.string();
validationSchema['SENTRY_ENABLED'] = Joi.string().default(environment.sentry?.enabled ?? false);
validationSchema['SENTRY_DSN'] = Joi.string();
validationSchema['STORE_FILE_PATH'] =
  Joi.string().default(environment.production ? '/data' : '/tmp/data/user-settings');
validationSchema['SETTINGS_DEFAULT_FILE_PATH'] =
  Joi.string().default(environment.production ? '/default/user-settings.json' : '/tmp/default/user-settings.json');
validationSchema['JWT_SECRET'] = Joi.string().default(GenerateRandomString());
validationSchema['OPEN_API_SERVER_CONFIG_FILE_PATH'] = Joi.string()
                                                          .default(environment.production ?
                                                            '/app/assets/open-api-server-config.json' :
                                                            join(
                                                              __dirname,
                                                              'assets/open-api-server-config.json',
                                                            ));
validationSchema['GET_USER_PROFILE_OPERATION_FILE_PATH'] = Joi.string()
                                                              .default(environment.production ?
                                                                '/app/assets/get-user-profile.json' :
                                                                join(
                                                                  __dirname,
                                                                  'assets/get-user-profile.json',
                                                                ));
export const VALIDATION_SCHEMA = Joi.object(validationSchema);
