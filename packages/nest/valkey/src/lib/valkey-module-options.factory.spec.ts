import { ConfigService } from '@nestjs/config';
import { ValkeyModuleOptionsFactory } from './valkey-module-options.factory';

function create(env: Record<string, unknown>) {
  const factory = new ValkeyModuleOptionsFactory();
  (factory as any).config = new ConfigService(env);
  return factory.create();
}

describe('ValkeyModuleOptionsFactory', () => {
  it('falls back to localhost:6379 without password/url/tls', () => {
    expect(create({})).toEqual({
      host: 'localhost',
      port: 6379,
      password: undefined,
      url: undefined,
      tls: false,
    });
  });

  it('reads host, port and password', () => {
    expect(
      create({ VALKEY_HOST: 'valkey', VALKEY_PORT: 7000, VALKEY_PASSWORD: 'pw' })
    ).toMatchObject({ host: 'valkey', port: 7000, password: 'pw' });
  });

  it('maps empty strings to undefined / defaults', () => {
    expect(
      create({ VALKEY_PASSWORD: '', VALKEY_URL: '', VALKEY_TLS: '' })
    ).toMatchObject({ password: undefined, url: undefined, tls: false });
  });

  it('reads VALKEY_URL', () => {
    expect(create({ VALKEY_URL: 'rediss://h:6380' }).url).toBe('rediss://h:6380');
  });

  it.each([
    [true, true],
    ['true', true],
    ['1', true],
    [false, false],
    ['false', false],
    ['0', false],
  ])('reads VALKEY_TLS=%p as %p', (raw, expected) => {
    expect(create({ VALKEY_TLS: raw }).tls).toBe(expected);
  });
});
