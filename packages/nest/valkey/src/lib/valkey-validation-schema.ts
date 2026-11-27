import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';

/**
 * Empty strings are accepted for every variable (docker compose passes unset
 * variables through as ""), and fall back to the default.
 *
 * - VALKEY_URL (`redis://` / `rediss://`) takes precedence over VALKEY_HOST/VALKEY_PORT.
 * - VALKEY_PASSWORD has no default: unset/empty means "connect without auth".
 * - VALKEY_TLS enables TLS for host/port connections (`rediss://` implies TLS).
 */
export function valkeyValidationSchema(
  environment: Environment,
  { host = 'localhost', port = 6379 }: { host?: string; port?: number } = {}
): Joi.PartialSchemaMap {
  return {
    VALKEY_HOST: Joi.string().empty('').default(host),
    VALKEY_PORT: Joi.number().empty('').default(port),
    VALKEY_PASSWORD: Joi.string().allow('').default(''),
    VALKEY_URL: Joi.string()
      .uri({ scheme: ['redis', 'rediss'] })
      .allow('')
      .default(''),
    VALKEY_TLS: Joi.boolean().truthy('1').falsy('0').empty('').default(false),
  };
}
