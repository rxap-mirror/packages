import { BadRequestException, ExecutionContext, ForbiddenException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseAppCheckGuard } from './firebase-app-check.guard';

jest.mock('firebase-admin', () => ({ appCheck: jest.fn() }));

function ctx(headers: Record<string, string>): ExecutionContext {
  return { switchToHttp: () => ({ getRequest: () => ({ headers }) }) } as any;
}

describe('FirebaseAppCheckGuard', () => {
  let guard: FirebaseAppCheckGuard;
  let verifyToken: jest.Mock;

  beforeEach(() => {
    guard = new FirebaseAppCheckGuard();
    (guard as any).logger = { debug: jest.fn() };
    verifyToken = jest.fn();
    (admin.appCheck as jest.Mock).mockReturnValue({ verifyToken });
  });

  it('is bypassed when deactivated', async () => {
    (guard as any).deactivated = true;
    await expect(guard.canActivate(ctx({}))).resolves.toBe(true);
    expect(verifyToken).not.toHaveBeenCalled();
  });

  it('rejects a missing header', async () => {
    await expect(guard.canActivate(ctx({}))).rejects.toThrow(BadRequestException);
  });

  it('accepts a valid token', async () => {
    verifyToken.mockResolvedValue({});
    await expect(guard.canActivate(ctx({ 'x-firebase-appcheck': 't' }))).resolves.toBe(true);
    expect(verifyToken).toHaveBeenCalledWith('t');
  });

  it('rejects an invalid token', async () => {
    verifyToken.mockRejectedValue(new Error('bad'));
    await expect(guard.canActivate(ctx({ 'x-firebase-appcheck': 't' }))).rejects.toThrow(ForbiddenException);
  });
});
