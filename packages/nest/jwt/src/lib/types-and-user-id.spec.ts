jest.mock('passport-jwt', () => ({ ExtractJwt: {} }), { virtual: true });

import { AsyncContext } from '@nestjs/cqrs';
import {
  IsRequestWithJwt,
  isJwtPayload,
  isOIDCJwtPayload,
  isRequestWithJwtAndUser,
  isRequestWithUser,
  isRequestWithUserSub,
  isSecureJwtPayload,
} from './types';
import { JwtModuleOptionsLoader } from './jwt-module-options-loader';
import { USER_ID } from './token';
import { UserContext } from './user.context';
import { providerUserId, userIdFactory } from './user-id.factory';

describe('type guards', () => {
  it('isJwtPayload', () => {
    expect(isJwtPayload({})).toBe(true);
    expect(isJwtPayload(null)).toBe(false);
    expect(isJwtPayload('x')).toBe(false);
  });
  it('isOIDCJwtPayload', () => {
    expect(isOIDCJwtPayload({ iss: 'i', sub: 's', aud: 'a', exp: 1, iat: 1 })).toBe(true);
    expect(isOIDCJwtPayload({ sub: 's' })).toBe(false);
  });
  it('isSecureJwtPayload', () => {
    expect(isSecureJwtPayload({ sub: 's', exp: 1 })).toBe(true);
    expect(isSecureJwtPayload({ sub: 's' })).toBe(false);
  });
  it('request guards', () => {
    expect(IsRequestWithJwt({ jwt: {} } as any)).toBe(true);
    expect(IsRequestWithJwt({} as any)).toBe(false);
    expect(isRequestWithUser({ user: {} } as any)).toBe(true);
    expect(isRequestWithUser({ user: null } as any)).toBe(false);
    expect(isRequestWithUserSub({ user: { sub: 's' } } as any)).toBe(true);
    expect(isRequestWithUserSub({ user: {} } as any)).toBe(false);
    expect(isRequestWithJwtAndUser({ jwt: {}, user: {} } as any)).toBe(true);
    expect(isRequestWithJwtAndUser({ jwt: {} } as any)).toBe(false);
  });
});

describe('UserContext', () => {
  it('is created from a request with user sub', () => {
    const ctx = UserContext.fromRequest({ user: { sub: 'u' } } as any);
    expect(ctx.userId).toBe('u');
    expect(ctx).toBeInstanceOf(AsyncContext);
  });
  it('throws otherwise', () => {
    expect(() => UserContext.fromRequest({ user: {} } as any)).toThrow('sub property');
    expect(() => UserContext.fromRequest({} as any)).toThrow('user object');
  });
});

describe('userIdFactory', () => {
  it('handles a UserContext', () => {
    expect(userIdFactory(new UserContext('c'))).toBe('c');
  });
  it('handles AsyncContext with userId', () => {
    const c: any = new AsyncContext();
    c.userId = 'x';
    expect(userIdFactory(c)).toBe('x');
    c.userId = 1;
    expect(() => userIdFactory(c)).toThrow('not a string');
  });
  it('rejects plain AsyncContext', () => {
    expect(() => userIdFactory(new AsyncContext())).toThrow('not a UserContext');
  });
  it('handles requests', () => {
    expect(userIdFactory({ user: { sub: 'r' } } as any)).toBe('r');
    expect(() => userIdFactory({ user: {} } as any)).toThrow('sub property');
    expect(() => userIdFactory({} as any)).toThrow('not a RequestWithUser');
  });
  it('providerUserId wires USER_ID', () => {
    expect(providerUserId()).toMatchObject({ provide: USER_ID, useFactory: userIdFactory });
  });
});

describe('JwtModuleOptionsLoader', () => {
  it('requires JWT_SECRET', () => {
    const l = new JwtModuleOptionsLoader();
    (l as any).config = { getOrThrow: jest.fn().mockReturnValue('sec') };
    expect(l.createJwtOptions()).toEqual({ global: true, secret: 'sec' });
    (l as any).config = { getOrThrow: () => { throw new Error('missing'); } };
    expect(() => l.createJwtOptions()).toThrow('missing');
  });
});
