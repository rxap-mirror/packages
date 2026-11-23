import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { FIREBASE_AUTH } from '@rxap/firebase';
import {
  IDENTITY_PLATFORM_HTTP_INTERCEPTOR_URL_PATTERN,
  IdentityPlatformHttpInterceptor,
  idToken,
} from './identity-platform.http-interceptor';

type IdTokenCallbacks = {
  next: (user: unknown) => void;
  error: (error: unknown) => void;
  complete: () => void;
};

const onIdTokenChangedFn = vi.fn();
const unsubscribe = vi.fn();

vi.mock('firebase/auth', () => ({
  onIdTokenChanged: (...args: unknown[]) => onIdTokenChangedFn(...args),
}));

/** Makes onIdTokenChanged emit the given user synchronously on subscription. */
function emitUser(user: unknown) {
  onIdTokenChangedFn.mockImplementation((_auth: unknown, next: (u: unknown) => void) => {
    next(user);
    return unsubscribe;
  });
}

describe('idToken', () => {
  const auth = { id: 'auth' } as any;

  beforeEach(() => {
    onIdTokenChangedFn.mockReset();
    unsubscribe.mockReset();
  });

  it('emits null when no user is signed in', () => {
    emitUser(null);
    const values: Array<string | null> = [];
    idToken(auth).subscribe(v => values.push(v));
    expect(values).toEqual([null]);
    expect(onIdTokenChangedFn.mock.calls[0][0]).toBe(auth);
  });

  it('emits the id token of the user', async () => {
    emitUser({ getIdToken: () => Promise.resolve('abc') });
    const values: Array<string | null> = [];
    idToken(auth).subscribe(v => values.push(v));
    await Promise.resolve();
    expect(values).toEqual(['abc']);
  });

  it('forwards an error when the id token can not be resolved', async () => {
    emitUser({ getIdToken: () => Promise.reject(new Error('token failed')) });
    const errors: unknown[] = [];
    idToken(auth).subscribe({ error: e => errors.push(e) });
    await Promise.resolve();
    await Promise.resolve();
    expect((errors[0] as Error).message).toBe('token failed');
  });

  it('forwards error and complete notifications of the auth listener and unsubscribes', () => {
    let callbacks!: IdTokenCallbacks;
    onIdTokenChangedFn.mockImplementation((_a: unknown, next: any, error: any, complete: any) => {
      callbacks = { next, error, complete };
      return unsubscribe;
    });

    const completed = vi.fn();
    idToken(auth).subscribe({ complete: completed });
    callbacks.complete();
    expect(completed).toHaveBeenCalled();

    const errorHandler = vi.fn();
    const sub = idToken(auth).subscribe({ error: errorHandler });
    callbacks.error(new Error('listener failed'));
    expect(errorHandler).toHaveBeenCalledWith(expect.objectContaining({ message: 'listener failed' }));
    sub.unsubscribe();

    const sub2 = idToken(auth).subscribe();
    sub2.unsubscribe();
    expect(unsubscribe).toHaveBeenCalled();
  });
});

describe('IdentityPlatformHttpInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;
  const signOut = vi.fn();
  const reload = vi.fn();

  function setup(pattern?: RegExp | RegExp[]) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([IdentityPlatformHttpInterceptor])),
        provideHttpClientTesting(),
        { provide: FIREBASE_AUTH, useValue: { signOut } },
        ...(pattern === undefined ? [] : [{ provide: IDENTITY_PLATFORM_HTTP_INTERCEPTOR_URL_PATTERN, useValue: pattern }]),
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => {
    onIdTokenChangedFn.mockReset();
    unsubscribe.mockReset();
    signOut.mockReset().mockResolvedValue(undefined);
    reload.mockReset();
    vi.stubGlobal('location', { reload });
  });

  afterEach(() => {
    ctrl.verify();
    vi.unstubAllGlobals();
  });

  it('passes through when no url pattern is configured', () => {
    setup();
    http.get('/api/x').subscribe();
    const req = ctrl.expectOne('/api/x');
    expect(req.request.headers.has('idToken')).toBe(false);
    expect(onIdTokenChangedFn).not.toHaveBeenCalled();
    req.flush({});
  });

  it('passes through for urls that do not match the pattern', () => {
    setup(/\/secure\//);
    http.get('/public/x').subscribe();
    const req = ctrl.expectOne('/public/x');
    expect(req.request.headers.has('idToken')).toBe(false);
    req.flush({});
  });

  it('adds the id token header for matching urls', async () => {
    emitUser({ getIdToken: () => Promise.resolve('tok-1') });
    setup(/\/secure\//);
    const results: unknown[] = [];
    http.get('/secure/x').subscribe(r => results.push(r));
    await Promise.resolve();
    const req = ctrl.expectOne('/secure/x');
    expect(req.request.headers.get('idToken')).toBe('tok-1');
    req.flush({ ok: true });
    expect(results).toEqual([{ ok: true }]);
  });

  it('supports a list of patterns', async () => {
    emitUser({ getIdToken: () => Promise.resolve('tok-2') });
    setup([/\/a\//, /\/b\//]);
    http.get('/b/x').subscribe();
    await Promise.resolve();
    const req = ctrl.expectOne('/b/x');
    expect(req.request.headers.get('idToken')).toBe('tok-2');
    req.flush({});
  });

  it('fails the request when the user is not signed in', () => {
    emitUser(null);
    setup(/\/secure\//);
    const errors: unknown[] = [];
    http.get('/secure/x').subscribe({ error: e => errors.push(e) });
    expect(errors).toHaveLength(1);
    expect((errors[0] as Error).message).toContain(`before sending a request to '/secure/x'`);
    ctrl.expectNone('/secure/x');
  });

  it('signs the user out and reloads the page on a 401 response', async () => {
    emitUser({ getIdToken: () => Promise.resolve('tok-3') });
    setup(/\/secure\//);
    const errors: unknown[] = [];
    http.get('/secure/x').subscribe({ error: e => errors.push(e) });
    await Promise.resolve();
    ctrl.expectOne('/secure/x').flush('nope', { status: 401, statusText: 'Unauthorized' });
    expect(errors).toHaveLength(1);
    expect(signOut).toHaveBeenCalledTimes(1);
    await Promise.resolve();
    await Promise.resolve();
    expect(reload).toHaveBeenCalledTimes(1);
  });

  it('rethrows other http errors without signing out', async () => {
    emitUser({ getIdToken: () => Promise.resolve('tok-4') });
    setup(/\/secure\//);
    const errors: any[] = [];
    http.get('/secure/x').subscribe({ error: e => errors.push(e) });
    await Promise.resolve();
    ctrl.expectOne('/secure/x').flush('boom', { status: 500, statusText: 'Server Error' });
    expect(errors[0].status).toBe(500);
    expect(signOut).not.toHaveBeenCalled();
    expect(reload).not.toHaveBeenCalled();
  });
});
