import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { InternalServerErrorException } from '@nestjs/common';
import { UserEmail } from './user-email.decorator';
import { UserSub } from './user-sub.decorator';
import { User } from './user.decorator';

function resolve(decorator: any, request: any) {
  class T {
    m(@decorator() _v: any) {}
  }
  const meta = Reflect.getMetadata(ROUTE_ARGS_METADATA, T, 'm');
  const factory = (Object.values(meta)[0] as any).factory;
  return factory(undefined, { switchToHttp: () => ({ getRequest: () => request }) });
}

describe('param decorators', () => {
  describe('UserSub', () => {
    it('reads sub from jwt or user', () => {
      expect(resolve(UserSub, { jwt: { sub: 'a' } })).toBe('a');
      expect(resolve(UserSub, { user: { sub: 'b' } })).toBe('b');
      expect(resolve(UserSub, { jwt: { sub: 'a' }, user: { sub: 'b' } })).toBe('b');
    });
    it('throws on missing data', () => {
      expect(() => resolve(UserSub, {})).toThrow(InternalServerErrorException);
      expect(() => resolve(UserSub, { jwt: {} })).toThrow('missing the sub claim');
    });
  });

  describe('UserEmail', () => {
    it('reads email', () => {
      expect(resolve(UserEmail, { jwt: { email: 'e' } })).toBe('e');
      expect(resolve(UserEmail, { user: { email: 'u' } })).toBe('u');
    });
    it('throws on missing data', () => {
      expect(() => resolve(UserEmail, {})).toThrow(InternalServerErrorException);
      expect(() => resolve(UserEmail, { jwt: {} })).toThrow('missing the email claim');
    });
  });

  describe('User', () => {
    it('returns request.user', () => {
      const u = { sub: 'x' };
      expect(resolve(User, { user: u })).toBe(u);
    });
    it('throws without user', () => {
      expect(() => resolve(User, {})).toThrow(InternalServerErrorException);
    });
  });
});
