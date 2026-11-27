import * as Joi from 'joi';
import { valkeyValidationSchema } from './valkey-validation-schema';

function validate(env: Record<string, unknown>) {
  return Joi.object(valkeyValidationSchema('development' as any)).validate(env);
}

describe('valkeyValidationSchema', () => {
  it('applies the defaults', () => {
    const { error, value } = validate({});

    expect(error).toBeUndefined();
    expect(value).toEqual({
      VALKEY_HOST: 'localhost',
      VALKEY_PORT: 6379,
      VALKEY_PASSWORD: '',
      VALKEY_URL: '',
      VALKEY_TLS: false,
    });
  });

  it('honours custom host and port defaults', () => {
    const schema = Joi.object(
      valkeyValidationSchema('development' as any, { host: 'valkey', port: 7000 })
    );

    expect(schema.validate({}).value).toMatchObject({
      VALKEY_HOST: 'valkey',
      VALKEY_PORT: 7000,
    });
  });

  it('coerces the port from a string', () => {
    expect(validate({ VALKEY_PORT: '6380' }).value.VALKEY_PORT).toBe(6380);
  });

  it('rejects a non numeric port', () => {
    expect(validate({ VALKEY_PORT: 'abc' }).error).toBeDefined();
  });

  it.each(['redis://localhost:6379', 'rediss://user:pw@host:6380/1', 'redis://:pw@host'])(
    'accepts the url %s',
    (url) => {
      expect(validate({ VALKEY_URL: url }).error).toBeUndefined();
    }
  );

  it.each(['http://localhost', 'localhost:6379', 'not a url'])(
    'rejects the url %s',
    (url) => {
      expect(validate({ VALKEY_URL: url }).error).toBeDefined();
    }
  );

  it('accepts empty strings for every variable (compose passes unset vars as "")', () => {
    const { error, value } = validate({
      VALKEY_HOST: '',
      VALKEY_PORT: '',
      VALKEY_PASSWORD: '',
      VALKEY_URL: '',
      VALKEY_TLS: '',
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({
      VALKEY_HOST: 'localhost',
      VALKEY_PORT: 6379,
      VALKEY_PASSWORD: '',
      VALKEY_URL: '',
      VALKEY_TLS: false,
    });
  });

  it.each([
    ['true', true],
    ['false', false],
    ['1', true],
    ['0', false],
  ])('parses VALKEY_TLS=%s', (raw, expected) => {
    expect(validate({ VALKEY_TLS: raw }).value.VALKEY_TLS).toBe(expected);
  });

  it('rejects an invalid VALKEY_TLS', () => {
    expect(validate({ VALKEY_TLS: 'maybe' }).error).toBeDefined();
  });
});
