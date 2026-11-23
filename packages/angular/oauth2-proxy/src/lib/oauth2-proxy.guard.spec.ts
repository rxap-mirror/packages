import type { Mock } from 'vitest';
import {
  HttpErrorResponse,
  provideHttpClient,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { oauth2ProxyGuard } from './oauth2-proxy.guard';

describe('oauth2ProxyGuard', () => {
  let http: HttpTestingController;
  // jsdom does not implement navigation (and location.replace cannot be spied
  // on), so the global location is replaced by a stub that records the redirect.
  let replace: Mock;
  const navigated = () => replace.mock.calls.some(([target]: any[]) => target === 'http://localhost/oauth2/sign_in');

  beforeEach(() => {
    replace = vi.fn();
    vi.stubGlobal('location', { origin: 'http://localhost', replace });
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    http.verify();
  });

  const run = () => TestBed.runInInjectionContext(() => oauth2ProxyGuard({} as any, {} as any)) as Promise<boolean>;

  it('allows activation when authenticated', async () => {
    const result = run();
    http.expectOne('/oauth2/auth').flush({});
    await expect(result).resolves.toBe(true);
    expect(navigated()).toBe(false);
  });

  it('redirects to sign in on 401', async () => {
    const result = run();
    http.expectOne('/oauth2/auth').flush('', { status: 401, statusText: 'Unauthorized' });
    await expect(result).resolves.toBe(false);
    expect(navigated()).toBe(true);
  });

  it('rethrows other http errors', async () => {
    const result = run();
    http.expectOne('/oauth2/auth').flush('', { status: 500, statusText: 'Server' });
    await expect(result).rejects.toBeInstanceOf(HttpErrorResponse);
    expect(navigated()).toBe(false);
  });

  it('rethrows non http errors', async () => {
    const result = run();
    http.expectOne('/oauth2/auth').error(new ProgressEvent('error'));
    await expect(result).rejects.toBeDefined();
  });
});
