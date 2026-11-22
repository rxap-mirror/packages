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

import { ExecutionContext } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@rxap/nest-utilities';
import { AUTH0_BYPASS_KEY } from './auth0-bypass';
import { Auth0Guard } from './auth0.guard';

describe('Auth0Guard', () => {
  let guard: Auth0Guard;
  let jwtService: { verifyAsync: jest.Mock };
  let logger: Record<string, jest.Mock>;
  let reflector: { getAllAndOverride: jest.Mock };
  let options: { disabled?: boolean };

  const ctx = (request: any): ExecutionContext =>
    ({
      getHandler: () => 'handler',
      getClass: () => 'class',
      switchToHttp: () => ({ getRequest: () => request }),
    }) as any;

  beforeEach(() => {
    jwtService = { verifyAsync: jest.fn() };
    logger = { warn: jest.fn(), debug: jest.fn(), verbose: jest.fn() };
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    options = {};
    guard = new Auth0Guard();
    Object.assign(guard as any, { jwtService, logger, reflector, options });
  });

  it('allows public routes', async () => {
    reflector.getAllAndOverride.mockImplementation((k) => k === IS_PUBLIC_KEY);
    await expect(guard.canActivate(ctx({}))).resolves.toBe(true);
  });

  it('allows bypassed routes', async () => {
    reflector.getAllAndOverride.mockImplementation((k) => k === AUTH0_BYPASS_KEY);
    await expect(guard.canActivate(ctx({}))).resolves.toBe(true);
  });

  it('rejects when no bearer token is present', async () => {
    await expect(guard.canActivate(ctx({ headers: {} }))).resolves.toBe(false);
    expect(jwtService.verifyAsync).not.toHaveBeenCalled();
  });

  it('verifies the bearer token and attaches the payload', async () => {
    jwtService.verifyAsync.mockResolvedValue({ sub: 'u1' });
    const request: any = { headers: { authorization: 'Bearer abc' } };
    await expect(guard.canActivate(ctx(request))).resolves.toBe(true);
    expect(jwtService.verifyAsync).toHaveBeenCalledWith('abc');
    expect(request.user).toEqual({ sub: 'u1' });
  });

  it('rejects when the payload is empty', async () => {
    jwtService.verifyAsync.mockResolvedValue(null);
    const request: any = { headers: { authorization: 'Bearer abc' } };
    await expect(guard.canActivate(ctx(request))).resolves.toBe(false);
    expect(request.user).toBeUndefined();
  });

  it('propagates verification errors', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));
    const request: any = { headers: { authorization: 'Bearer abc' } };
    await expect(guard.canActivate(ctx(request))).rejects.toThrow('invalid');
  });

  describe('when disabled', () => {
    beforeEach(() => {
      options.disabled = true;
    });

    it('builds the user from x-user-* headers', async () => {
      const request: any = {
        headers: {
          'x-user-id': 'id1',
          'x-user-email': 'a@b.c',
          'x-user-roles': 'admin',
          'x-user-name': 'N',
        },
      };
      await expect(guard.canActivate(ctx(request))).resolves.toBe(true);
      expect(request.user).toMatchObject({ sub: 'id1', email: 'a@b.c', roles: 'admin', name: 'N' });
    });

    it('prefers x-user-sub over x-user-id', async () => {
      const request: any = { headers: { 'x-user-id': 'id1', 'x-user-sub': 'sub1' } };
      await guard.canActivate(ctx(request));
      expect(request.user.sub).toBe('sub1');
    });

    it('falls back to bearer authentication without a user id header', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: 'jwt-user' });
      const request: any = { headers: { authorization: 'Bearer t' } };
      await expect(guard.canActivate(ctx(request))).resolves.toBe(true);
      expect(request.user).toEqual({ sub: 'jwt-user' });
    });

    it('rejects without headers and token', async () => {
      await expect(guard.canActivate(ctx({ headers: {} }))).resolves.toBe(false);
    });
  });
});
