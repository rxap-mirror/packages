import { PermissionsGuard } from './permission.guard';
import { Permissions, PERMISSIONS_METADATA } from './permissions.decorator';

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: { get: jest.Mock };

  const ctx = (req: any): any => ({
    getHandler: () => 'h',
    switchToHttp: () => ({ getRequest: () => req }),
  });

  beforeEach(() => {
    reflector = { get: jest.fn() };
    guard = new PermissionsGuard(reflector as any);
    (guard as any).logger = { debug: jest.fn(), verbose: jest.fn(), warn: jest.fn() };
  });

  it('allows routes without permissions', () => {
    reflector.get.mockReturnValue(undefined);
    expect(guard.canActivate(ctx({}))).toBe(true);
    reflector.get.mockReturnValue([]);
    expect(guard.canActivate(ctx({}))).toBe(true);
  });

  it('denies without user or with non-object user', () => {
    reflector.get.mockReturnValue(['a']);
    expect(guard.canActivate(ctx({}))).toBe(false);
    expect(guard.canActivate(ctx({ user: 'x' }))).toBe(false);
    expect(guard.canActivate(ctx({ user: null }))).toBe(false);
  });

  it('denies when permissions are missing or not an array', () => {
    reflector.get.mockReturnValue(['a']);
    expect(guard.canActivate(ctx({ user: {} }))).toBe(false);
    expect(guard.canActivate(ctx({ user: { permissions: 'a' } }))).toBe(false);
  });

  it('requires all permissions', () => {
    reflector.get.mockReturnValue(['a', 'b']);
    expect(guard.canActivate(ctx({ user: { permissions: ['a'] } }))).toBe(false);
    expect(guard.canActivate(ctx({ user: { permissions: ['a', 'b', 'c'] } }))).toBe(true);
  });

  it('Permissions decorator stores metadata', () => {
    class T {
      @Permissions('x', 'y')
      m() {}
    }
    expect(Reflect.getMetadata(PERMISSIONS_METADATA, T.prototype.m)).toEqual(['x', 'y']);
  });
});
