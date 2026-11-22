import { InternalServerErrorException } from '@nestjs/common';
import { IS_PUBLIC_KEY } from '@rxap/nest-utilities';
import { UserGuard } from './user.guard';

describe('UserGuard', () => {
  let guard: UserGuard;
  let reflector: { getAllAndOverride: jest.Mock };
  let cmd: { execute: jest.Mock };
  const ctx = (req: any): any => ({
    getHandler: () => 'h',
    getClass: () => 'c',
    switchToHttp: () => ({ getRequest: () => req }),
  });

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) };
    cmd = { execute: jest.fn().mockResolvedValue({ sub: 's', email: 'e' }) };
    guard = new UserGuard();
    Object.assign(guard as any, { reflector, getUserCommand: cmd });
  });

  it('skips public routes', async () => {
    reflector.getAllAndOverride.mockImplementation((k) => k === IS_PUBLIC_KEY);
    await expect(guard.canActivate(ctx({}))).resolves.toBe(true);
    expect(cmd.execute).not.toHaveBeenCalled();
  });

  it('fails without jwt', async () => {
    await expect(guard.canActivate(ctx({}))).rejects.toThrow(InternalServerErrorException);
  });

  it('loads the user once per sub and caches it', async () => {
    const r1: any = { jwt: { sub: 's' } };
    const r2: any = { jwt: { sub: 's' } };
    await guard.canActivate(ctx(r1));
    await guard.canActivate(ctx(r2));
    expect(cmd.execute).toHaveBeenCalledTimes(1);
    expect(r2.user).toEqual({ sub: 's', email: 'e' });
  });
});
