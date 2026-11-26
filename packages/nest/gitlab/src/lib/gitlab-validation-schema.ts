import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';
import { SchemaMap } from 'joi';

/**
 * Joi schema for the environment variables read by the `GitlabModuleOptionsFactory`.
 *
 * - `GITLAB_TOKEN` (private token) and `GITLAB_OAUTH_TOKEN` (bearer token) are mutually exclusive.
 *   In production exactly one of them is required.
 * - `GITLAB_PROJECT` (project id or path) is optional.
 */
export function gitlabValidationSchema(
  environment: Environment,
  { host = 'https://gitlab.com' }: { host?: string } = {},
) {
  const schema: SchemaMap = {};

  schema['GITLAB_HOST'] = Joi.string().default(host);

  const token = Joi.string().when('GITLAB_OAUTH_TOKEN', {
    is: Joi.exist(),
    then: Joi.forbidden(),
    otherwise: environment.production ? Joi.required() : Joi.optional(),
  });
  schema['GITLAB_TOKEN'] = token;
  schema['GITLAB_OAUTH_TOKEN'] = Joi.string();
  schema['GITLAB_PROJECT'] = Joi.string();

  return schema;
}
