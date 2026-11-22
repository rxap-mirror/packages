import {
  BadRequestException,
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseAuthGuard } from './firebase-auth.guard';

jest.mock('firebase-admin', () => ({ auth: jest.fn() }));

function ctx(request: any): ExecutionContext {
  return { switchToHttp: () => ({ getRequest: () => request }) } as any;
}

describe('FirebaseAuthGuard (unit)', () => {
  let guard: FirebaseAuthGuard;
  let verifyIdToken: jest.Mock;
  let logger: { debug: jest.Mock; verbose: jest.Mock };

  beforeEach(() => {
    guard = new FirebaseAuthGuard();
    logger = { debug: jest.fn(), verbose: jest.fn() };
    (guard as any).logger = logger;
    (guard as any).authHeaderName = 'IdToken';
    verifyIdToken = jest.fn();
    (admin.auth as unknown as jest.Mock).mockReturnValue({ verifyIdToken });
  });

  describe('canActivate', () => {
    it('is bypassed when deactivated', async () => {
      (guard as any).deactivated = true;
      await expect(guard.canActivate(ctx({}))).resolves.toBe(true);
    });

    it('rejects a missing header', async () => {
      await expect(guard.canActivate(ctx({ headers: {} }))).rejects.toThrow(BadRequestException);
    });

    it('rejects a repeated header', async () => {
      await expect(guard.canActivate(ctx({ headers: { idtoken: ['a', 'b'] } }))).rejects.toThrow(
        /multiple times/,
      );
    });

    it('wraps unexpected validation errors', async () => {
      jest.spyOn(guard, 'validateIdToken').mockRejectedValue(new Error('x'));
      await expect(guard.canActivate(ctx({ headers: { idtoken: 't' } }))).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('rejects invalid tokens', async () => {
      jest.spyOn(guard, 'validateIdToken').mockResolvedValue(null);
      await expect(guard.canActivate(ctx({ headers: { idtoken: 't' } }))).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('sets the user on the request (header name lowercased)', async () => {
      const user = { uid: '1' };
      jest.spyOn(guard, 'validateIdToken').mockResolvedValue(user as any);
      const req: any = { headers: { idtoken: 't' } };
      await expect(guard.canActivate(ctx(req))).resolves.toBe(true);
      expect(req.user).toBe(user);
    });
  });

  describe('validateIdToken', () => {
    it('accepts anonymous users', async () => {
      const res = { firebase: { sign_in_provider: 'anonymous' } };
      verifyIdToken.mockResolvedValue(res);
      await expect(guard.validateIdToken('t')).resolves.toBe(res);
      expect(verifyIdToken).toHaveBeenCalledWith('t', true);
    });

    it('accepts verified emails', async () => {
      const res = { email_verified: true, firebase: { sign_in_provider: 'password' } };
      verifyIdToken.mockResolvedValue(res);
      await expect(guard.validateIdToken('t')).resolves.toBe(res);
    });

    it('rejects unverified emails by default', async () => {
      verifyIdToken.mockResolvedValue({ email_verified: false });
      await expect(guard.validateIdToken('t')).resolves.toBeNull();
    });

    it('accepts unverified emails when allowed', async () => {
      (guard as any).allowUnverifiedEmail = true;
      const res = { email_verified: false };
      verifyIdToken.mockResolvedValue(res);
      await expect(guard.validateIdToken('t')).resolves.toBe(res);
    });

    it('returns null when verification fails', async () => {
      verifyIdToken.mockRejectedValue(new Error('expired'));
      await expect(guard.validateIdToken('t')).resolves.toBeNull();
      expect(logger.verbose).toHaveBeenCalled();
    });
  });
});
