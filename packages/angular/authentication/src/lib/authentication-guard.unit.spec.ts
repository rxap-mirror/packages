import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RxapAuthenticationGuard } from './authentication.guard';
import { RxapAuthenticationService } from './authentication.service';
import { RXAP_AUTHENTICATION_DEACTIVATED } from './tokens';

describe('RxapAuthenticationGuard (unit)', () => {
  let isAuthenticated: boolean | null;
  const router = { createUrlTree: vi.fn((commands: any[], extras?: any) => ({ commands, extras })) };

  function create(deactivated = false) {
    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: router },
        { provide: RxapAuthenticationService, useValue: { isAuthenticated: () => Promise.resolve(isAuthenticated) } },
        { provide: RXAP_AUTHENTICATION_DEACTIVATED, useValue: deactivated },
      ],
    });
    return TestBed.inject(RxapAuthenticationGuard);
  }
  const state = (url: string) => ({ url }) as any;

  beforeEach(() => {
    router.createUrlTree.mockClear();
    vi.spyOn(console, 'debug').mockImplementation(() => undefined);
  });

  it('allows everything when deactivated', async () => {
    const guard = create(true);
    expect(await guard.canActivate({} as any, state('/x'))).toBe(true);
  });

  it('redirects to loading while status is unknown and remembers the url', async () => {
    isAuthenticated = null;
    const guard = create();
    const result: any = await guard.canActivate({} as any, state('/a/b'));
    expect(result.commands).toEqual([ '/', 'authentication', 'loading' ]);
    expect(guard.lastUrl).toBe('/a/b');
  });

  it('redirects unauthenticated users to login', async () => {
    isAuthenticated = false;
    const guard = create();
    const result: any = await guard.canActivateChild({} as any, state('/a'));
    expect(result.commands).toEqual([ '/', 'authentication', 'login' ]);
    expect(guard.lastUrl).toBe('/a');
  });

  it('allows unauthenticated users on authentication pages', async () => {
    isAuthenticated = false;
    const guard = create();
    expect(await guard.canActivate({} as any, state('/authentication/login'))).toBe(true);
  });

  it('allows authenticated users on regular pages and clears lastUrl', async () => {
    isAuthenticated = true;
    const guard = create();
    guard.lastUrl = '/old';
    expect(await guard.canActivate({} as any, state('/dashboard'))).toBe(true);
    expect(guard.lastUrl).toBeNull();
  });

  it('redirects authenticated users from login back to the last url with query and fragment', async () => {
    isAuthenticated = true;
    const guard = create();
    guard.lastUrl = '/page?a=1&b=2#frag';
    const result: any = await guard.canActivate({} as any, state('/authentication/login'));
    expect(result.commands).toEqual([ '/page' ]);
    expect(result.extras).toEqual({ queryParams: { a: '1', b: '2' }, fragment: 'frag' });
    expect(guard.lastUrl).toBeNull();
  });

  it('redirects authenticated users from authentication pages to root, except reset-password', async () => {
    isAuthenticated = true;
    const guard = create();
    const result: any = await guard.canActivate({} as any, state('/authentication/login'));
    expect(result.commands).toEqual([ '/' ]);
    expect(await guard.canActivate({} as any, state('/authentication/reset-password/t'))).toBe(true);
  });

  it('falls back to the raw url when it cannot be parsed', async () => {
    isAuthenticated = true;
    const guard = create();
    guard.lastUrl = '#only-fragment';
    const result: any = await guard.canActivate({} as any, state('/'));
    expect(result.commands).toEqual([ '#only-fragment' ]);
  });
});
