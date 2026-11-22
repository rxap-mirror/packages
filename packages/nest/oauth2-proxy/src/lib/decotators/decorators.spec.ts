import { BadRequestException } from '@nestjs/common';
import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { AuthRequestAccessToken } from './auth-request-access-token.decorator';
import { AuthRequestEmail } from './auth-request-email.decorator';
import { AuthRequestGroups } from './auth-request-groups.decorator';
import { AuthRequestPreferredUsername } from './auth-request-preferred-username.decorator';
import { AuthRequestUser } from './auth-request-user.decorator';

function factoryOf(decorator: () => ParameterDecorator) {
  class Test {
    handler(@decorator() _value: unknown) {}
  }
  const args = Reflect.getMetadata(ROUTE_ARGS_METADATA, Test, 'handler');
  return Object.values<any>(args)[0].factory as (data: unknown, ctx: any) => unknown;
}

const ctxWith = (headers: Record<string, any>) =>
  ({ switchToHttp: () => ({ getRequest: () => ({ headers }) }) }) as any;

describe.each([
  ['AuthRequestUser', AuthRequestUser, 'x-auth-request-user'],
  ['AuthRequestEmail', AuthRequestEmail, 'x-auth-request-email'],
  ['AuthRequestAccessToken', AuthRequestAccessToken, 'x-auth-request-access-token'],
  ['AuthRequestPreferredUsername', AuthRequestPreferredUsername, 'x-auth-request-preferred-username'],
])('%s', (_name, decorator, header) => {
  const factory = factoryOf(decorator as any);

  it('returns the header value', () => {
    expect(factory(undefined, ctxWith({ [header]: 'value' }))).toBe('value');
  });

  it('throws when the header is missing', () => {
    expect(() => factory(undefined, ctxWith({}))).toThrow(BadRequestException);
    expect(() => factory(undefined, ctxWith({}))).toThrow(`Missing ${header} header`);
  });

  it('throws when the header occurs multiple times', () => {
    expect(() => factory(undefined, ctxWith({ [header]: ['a', 'b'] }))).toThrow(
      `Multiple ${header} headers found`,
    );
  });
});

describe('AuthRequestGroups', () => {
  const factory = factoryOf(AuthRequestGroups as any);

  it('splits the comma separated groups', () => {
    expect(factory(undefined, ctxWith({ 'x-auth-request-groups': 'a,b,c' }))).toEqual(['a', 'b', 'c']);
  });

  it('throws for missing and multiple headers', () => {
    expect(() => factory(undefined, ctxWith({}))).toThrow(BadRequestException);
    expect(() => factory(undefined, ctxWith({ 'x-auth-request-groups': ['a', 'b'] }))).toThrow(
      'Multiple x-auth-request-groups headers found',
    );
  });
});
