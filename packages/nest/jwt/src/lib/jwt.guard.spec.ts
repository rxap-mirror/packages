jest.mock(
  'passport-jwt',
  () => ({
    ExtractJwt: {
      fromAuthHeaderAsBearerToken: () => (req: any) => {
        const h = req.headers?.authorization;
        return typeof h === 'string' && h.startsWith('Bearer ') ? h.slice(7) : null;
      },
      fromHeader: (name: string) => (req: any) => req.headers?.[name.toLowerCase()] ?? null,
    },
  }),
  { virtual: true },
);

import { ExecutionContext, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@rxap/nest-utilities';
import { JwtGuard } from './jwt.guard';

describe('JwtGuard', () => {
  let guard: JwtGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let jwtService: { verify: jest.Mock; decode: jest.Mock };
  let env: Record<string, any>;

  const request = (headers: Record<string, string> = {}): any => ({
    headers,
    header: (n: string) => headers[n.toLowerCase()],
  });
  const ctx = (req: any): ExecutionContext =>
    ({
      getHandler: () => 'h',
      getClass: () => 'c',
      switchToHttp: () => ({ getRequest: () => req }),
    }) as any;

  beforeEach(() => {
    env = {};
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    jwtService = { verify: jest.fn(), decode: jest.fn() };
    guard = new JwtGuard();
    Object.assign(guard as any, {
      reflector,
      jwtService,
      config: { get: jest.fn((k: string, d?: any) => env[k] ?? d) },
    });
  });

  it('throws when the header is missing on a private route', () => {
    expect(() => guard.canActivate(ctx(request()))).toThrow(UnauthorizedException);
  });

  it('allows a missing header on a public route', () => {
    reflector.getAllAndOverride.mockImplementation((k) => k === IS_PUBLIC_KEY);
    expect(guard.canActivate(ctx(request()))).toBe(true);
  });

  it('decodes the bearer token without verification by default', () => {
    jwtService.decode.mockReturnValue({ sub: 's', exp: 1 });
    const req = request({ authorization: 'Bearer tok' });
    expect(guard.canActivate(ctx(req))).toBe(true);
    expect(jwtService.decode).toHaveBeenCalledWith('tok', { json: true });
    expect(req.jwt).toEqual({ sub: 's', exp: 1 });
  });

  it('verifies the token when JWT_VERIFY is set', () => {
    env['JWT_VERIFY'] = true;
    jwtService.verify.mockReturnValue({ sub: 's', exp: 1 });
    const req = request({ authorization: 'Bearer tok' });
    expect(guard.canActivate(ctx(req))).toBe(true);
    expect(jwtService.verify).toHaveBeenCalledWith('tok');
  });

  it('maps verification errors to Unauthorized', () => {
    env['JWT_VERIFY'] = true;
    jwtService.verify.mockImplementation(() => {
      throw new Error('bad');
    });
    expect(() => guard.canActivate(ctx(request({ authorization: 'Bearer t' })))).toThrow(UnauthorizedException);
  });

  it('reads a custom header', () => {
    env['JWT_AUTH_HEADER'] = 'X-Token';
    jwtService.decode.mockReturnValue({ sub: 's', exp: 1 });
    const req = request({ 'x-token': 'raw' });
    expect(guard.canActivate(ctx(req))).toBe(true);
    expect(jwtService.decode).toHaveBeenCalledWith('raw', { json: true });
  });

  it('rejects payloads without sub or exp unless public', () => {
    jwtService.decode.mockReturnValue({ sub: 's' });
    const req = request({ authorization: 'Bearer t' });
    expect(() => guard.canActivate(ctx(req))).toThrow(UnauthorizedException);
    reflector.getAllAndOverride.mockReturnValue(true);
    expect(guard.canActivate(ctx(req))).toBe(true);
    expect(req.jwt).toBeUndefined();
  });

  it('throws BadRequest for decode failures, null and string results', () => {
    const req = request({ authorization: 'Bearer t' });
    jwtService.decode.mockImplementation(() => {
      throw new Error('x');
    });
    expect(() => guard.canActivate(ctx(req))).toThrow(BadRequestException);
    jwtService.decode.mockReset().mockReturnValue(null);
    expect(() => guard.canActivate(ctx(req))).toThrow('decoded as null');
    jwtService.decode.mockReset().mockReturnValue('str');
    expect(() => guard.canActivate(ctx(req))).toThrow('decoded as a string');
  });
});
