jest.mock(
  'passport-jwt',
  () => ({
    ExtractJwt: {
      fromAuthHeaderAsBearerToken: () => (req: any) => {
        const h = req.headers?.authorization ?? req.headers?.Authorization;
        return typeof h === 'string' && h.startsWith('Bearer ') ? h.slice(7) : null;
      },
      fromHeader: (name: string) => (req: any) => req.headers?.[name.toLowerCase()] ?? null,
    },
  }),
  { virtual: true },
);

const jwtRegisterAsync = jest.fn().mockReturnValue({ module: class FakeJwt {} });
const passportJwtSecret = jest.fn();

jest.mock('@nestjs/jwt', () => ({
  ...jest.requireActual('@nestjs/jwt'),
  JwtModule: { registerAsync: jwtRegisterAsync },
}));
jest.mock('jwks-rsa', () => ({ passportJwtSecret }));

import { Auth0AuthenticationService } from './auth0-authentication.service';
import { Auth0ManagementService } from './auth0-management.service';
import { Auth0Module } from './auth0.module';
import {
  AUTH0_AUTHENTICATION_OPTIONS,
  AUTH0_MANAGEMENT_OPTIONS,
  AUTH0_OPTIONS,
} from './tokens';

describe('Auth0Module', () => {
  const options = {
    authentication: { domain: 'd.auth0.com', clientId: 'i', clientSecret: 's' },
    management: { domain: 'd.auth0.com', token: 't' },
  };

  const find = (m: any, token: any) => m.providers.find((p: any) => p.provide === token);

  it('registers option providers and exports', () => {
    const m = Auth0Module.register(options as any);
    expect(find(m, AUTH0_OPTIONS).useExisting).toBeDefined();
    expect(find(m, AUTH0_AUTHENTICATION_OPTIONS).useFactory(options)).toBe(options.authentication);
    expect(find(m, AUTH0_MANAGEMENT_OPTIONS).useFactory(options)).toBe(options.management);
    expect(find(m, AUTH0_AUTHENTICATION_OPTIONS).useFactory({})).toBeNull();
    expect(find(m, AUTH0_MANAGEMENT_OPTIONS).useFactory({})).toBeNull();
    expect(m.exports).toEqual(
      expect.arrayContaining([Auth0AuthenticationService, Auth0ManagementService, AUTH0_OPTIONS]),
    );
  });

  it('registerAsync also appends providers', () => {
    const m = Auth0Module.registerAsync({ useFactory: () => options } as any);
    expect(find(m, AUTH0_OPTIONS)).toBeDefined();
  });

  it('creates services from options or null', () => {
    const m = Auth0Module.register(options as any);
    const auth = find(m, Auth0AuthenticationService).useFactory;
    const mgmt = find(m, Auth0ManagementService).useFactory;
    expect(auth(null)).toBeNull();
    expect(mgmt(null)).toBeNull();
    expect(auth(options.authentication)).toBeInstanceOf(Auth0AuthenticationService);
    expect(mgmt(options.management)).toBeInstanceOf(Auth0ManagementService);
  });

  describe('jwt configuration', () => {
    const jwtOptions = () => {
      const config = {
        get: jest.fn((k: string, d?: any) =>
          ({ AUTH0_ISSUER_URL: 'https://i/', AUTH0_AUDIENCE: 'aud' } as any)[k] ?? d,
        ),
      };
      return jwtRegisterAsync.mock.calls[0][0].useFactory(config);
    };

    it('sets verify options', () => {
      expect(jwtOptions().verifyOptions).toEqual({
        audience: 'aud',
        issuer: 'https://i/',
        algorithms: ['RS256'],
      });
    });

    it('resolves the secret from jwks', async () => {
      passportJwtSecret.mockReturnValue((_r: any, _t: any, cb: any) => cb(null, 'secret'));
      await expect(jwtOptions().secretOrKeyProvider(null, 'tok')).resolves.toBe('secret');
      expect(passportJwtSecret).toHaveBeenCalledWith(
        expect.objectContaining({ jwksUri: 'https://i/.well-known/jwks.json' }),
      );
    });

    it('rejects on jwks errors and missing secret', async () => {
      passportJwtSecret.mockReturnValue((_r: any, _t: any, cb: any) => cb(new Error('boom')));
      await expect(jwtOptions().secretOrKeyProvider(null, 'tok')).rejects.toThrow('boom');
      passportJwtSecret.mockReturnValue((_r: any, _t: any, cb: any) => cb(null, undefined));
      await expect(jwtOptions().secretOrKeyProvider(null, 'tok')).rejects.toThrow('No secret found');
    });
  });
});
