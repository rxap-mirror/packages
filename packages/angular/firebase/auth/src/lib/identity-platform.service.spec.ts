import { TestBed } from '@angular/core/testing';
import { FIREBASE_AUTH } from '@rxap/firebase';
import { firstValueFrom } from 'rxjs';
import { authState, IdentityPlatformService } from './identity-platform.service';

const fns = vi.hoisted(() => ({
  onAuthStateChanged: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
  confirmPasswordReset: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  signInWithRedirect: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('firebase/auth', () => ({
  ...fns,
  GoogleAuthProvider: class GoogleAuthProvider { readonly providerId = 'google.com'; },
  GithubAuthProvider: class GithubAuthProvider { readonly providerId = 'github.com'; },
  FacebookAuthProvider: class FacebookAuthProvider { readonly providerId = 'facebook.com'; },
  TwitterAuthProvider: class TwitterAuthProvider { readonly providerId = 'twitter.com'; },
}));

/** Makes onAuthStateChanged emit the given user synchronously on subscription. */
function emitUser(user: unknown) {
  fns.onAuthStateChanged.mockImplementation((_auth: unknown, next: (u: unknown) => void) => {
    next(user);
    return vi.fn();
  });
}

describe('authState', () => {
  const auth = { id: 'auth' } as any;

  beforeEach(() => {
    fns.onAuthStateChanged.mockReset();
  });

  it('emits the current user and forwards all notifications', () => {
    let callbacks: any;
    const unsubscribe = vi.fn();
    fns.onAuthStateChanged.mockImplementation((a: unknown, next: any, error: any, complete: any) => {
      expect(a).toBe(auth);
      callbacks = { next, error, complete };
      return unsubscribe;
    });
    const values: unknown[] = [];
    const errors: unknown[] = [];
    const completed = vi.fn();
    const sub = authState(auth).subscribe({ next: v => values.push(v), error: e => errors.push(e), complete: completed });
    callbacks.next({ uid: 'u1' });
    callbacks.next(null);
    expect(values).toEqual([{ uid: 'u1' }, null]);
    callbacks.error(new Error('failed'));
    expect(errors).toHaveLength(1);
    sub.unsubscribe();
    expect(unsubscribe).toHaveBeenCalled();

    const completed$ = authState(auth).subscribe({ complete: completed });
    callbacks.complete();
    expect(completed).toHaveBeenCalled();
    completed$.unsubscribe();
  });
});

describe('IdentityPlatformService', () => {
  const auth = { id: 'auth' } as any;

  function setup(user: unknown = null) {
    emitUser(user);
    TestBed.configureTestingModule({
      providers: [IdentityPlatformService, { provide: FIREBASE_AUTH, useValue: auth }],
    });
    return TestBed.inject(IdentityPlatformService);
  }

  beforeEach(() => {
    Object.values(fns).forEach(fn => fn.mockReset());
  });

  it('initializes isAuthenticated$ with false when no user is signed in', async () => {
    const service = setup(null);
    expect(service.auth).toBe(auth);
    await vi.waitFor(() => expect(service.isAuthenticated$.value).toBe(false));
  });

  it('initializes isAuthenticated$ with true when a user is signed in', async () => {
    const service = setup({ uid: 'u1' });
    await vi.waitFor(() => expect(service.isAuthenticated$.value).toBe(true));
    expect(await service.isAuthenticated()).toBe(true);
  });

  it('exposes the auth state as user observable', async () => {
    const service = setup({ uid: 'u2' });
    expect(await firstValueFrom(service.user)).toEqual({ uid: 'u2' });
  });

  it('requests a password reset email', async () => {
    const service = setup();
    fns.sendPasswordResetEmail.mockResolvedValue(undefined);
    expect(await service.requestPasswordReset('a@b.c')).toBe(true);
    expect(fns.sendPasswordResetEmail).toHaveBeenCalledWith(auth, 'a@b.c');
  });

  it('confirms the password reset with the token', async () => {
    const service = setup();
    fns.confirmPasswordReset.mockResolvedValue(undefined);
    expect(await service.sendPasswordReset('new-pass', 'the-token')).toBe(true);
    expect(fns.confirmPasswordReset).toHaveBeenCalledWith(auth, 'the-token', 'new-pass');
  });

  it('signs in with email and password and marks the user as authenticated', async () => {
    const service = setup();
    fns.signInWithEmailAndPassword.mockResolvedValue({});
    expect(await service.signInWithEmailAndPassword('a@b.c', 'pw', true)).toBe(true);
    expect(fns.signInWithEmailAndPassword).toHaveBeenCalledWith(auth, 'a@b.c', 'pw');
    expect(service.isAuthenticated$.value).toBe(true);
  });

  it('does not mark the user as authenticated when the sign in fails', async () => {
    const service = setup();
    await vi.waitFor(() => expect(service.isAuthenticated$.value).toBe(false));
    fns.signInWithEmailAndPassword.mockRejectedValue(new Error('wrong password'));
    await expect(service.signInWithEmailAndPassword('a@b.c', 'bad', false)).rejects.toThrow('wrong password');
    expect(service.isAuthenticated$.value).toBe(false);
  });

  it('signs out and marks the user as not authenticated', async () => {
    const service = setup({ uid: 'u1' });
    await vi.waitFor(() => expect(service.isAuthenticated$.value).toBe(true));
    fns.signOut.mockResolvedValue(undefined);
    expect(await service.signOut()).toBe(true);
    expect(fns.signOut).toHaveBeenCalledWith(auth);
    expect(service.isAuthenticated$.value).toBe(false);
  });

  describe.each([
    ['google', 'google.com'],
    ['github', 'github.com'],
    ['facebook', 'facebook.com'],
    ['twitter', 'twitter.com'],
  ] as const)('%s sign in', (method, providerId) => {
    it('uses a popup by default', async () => {
      const service = setup();
      fns.signInWithPopup.mockResolvedValue({});
      expect(await service[method]()).toBe(true);
      expect(fns.signInWithPopup).toHaveBeenCalledWith(auth, expect.objectContaining({ providerId }));
      expect(fns.signInWithRedirect).not.toHaveBeenCalled();
      expect(service.isAuthenticated$.value).toBe(true);
    });

    it('uses a redirect when popup is disabled', async () => {
      const service = setup();
      fns.signInWithRedirect.mockResolvedValue(undefined);
      expect(await service[method](false)).toBe(true);
      expect(fns.signInWithRedirect).toHaveBeenCalledWith(auth, expect.objectContaining({ providerId }));
      expect(fns.signInWithPopup).not.toHaveBeenCalled();
    });
  });
});
