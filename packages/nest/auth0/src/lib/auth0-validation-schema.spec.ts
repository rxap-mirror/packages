import * as Joi from 'joi';
import { auth0ValidationSchema } from './auth0-validation-schema';

describe('auth0ValidationSchema', () => {
  const env = { app: 'test' } as any;

  it('defines all keys', () => {
    expect(Object.keys(auth0ValidationSchema(env)).sort()).toEqual(
      [
        'AUTH0_AUDIENCE',
        'AUTH0_CLIENT_ID',
        'AUTH0_CLIENT_SECRET',
        'AUTH0_DISABLED',
        'AUTH0_DOMAIN',
        'AUTH0_ISSUER_URL',
        'AUTH0_MANAGEMENT_TOKEN',
      ].sort(),
    );
  });

  it('applies truthy defaults only', () => {
    const schema = Joi.object(
      auth0ValidationSchema(env, { AUTH0_AUDIENCE: 'aud', AUTH0_DISABLED: false }),
    );
    const { value, error } = schema.validate({});
    expect(error).toBeUndefined();
    expect(value).toEqual({ AUTH0_AUDIENCE: 'aud' });
  });

  it('validates the domain', () => {
    const schema = Joi.object(auth0ValidationSchema(env));
    expect(schema.validate({ AUTH0_DOMAIN: 'x.auth0.com' }).error).toBeUndefined();
    expect(schema.validate({ AUTH0_DOMAIN: 'not a domain' }).error).toBeDefined();
  });
});
