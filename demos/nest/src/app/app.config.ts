import {
  corsValidationSchema,
  serverValidationSchema,
} from '@rxap/nest-server';
import { defaultValidationSchema } from '@rxap/nest-utilities';
import { SchemaMap } from 'joi';
import * as Joi from 'joi';
import { environment } from '../environments/environment';
import { GenerateRandomString } from '@rxap/utilities';
import { sentryValidationSchema } from '@rxap/nest-sentry';

const validationSchema: SchemaMap = {
  ...serverValidationSchema(environment, {
    port: 3709,
  }),
  ...corsValidationSchema(environment),
  ...defaultValidationSchema(environment),
  ...sentryValidationSchema(environment),
};
validationSchema['GLOBAL_API_PREFIX'] = Joi.string().default('api/nest');
export const VALIDATION_SCHEMA = Joi.object(validationSchema);
