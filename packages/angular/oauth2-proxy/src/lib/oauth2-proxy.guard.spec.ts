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
  // jsdom does not allow stubbing location.replace; a navigation attempt is
  // reported as a "not implemented" error on the console instead.
  let consoleError: jest.SpyInstance;
  const navigated = () => consoleError.mock.calls.some(([e]) => String(e?.message ?? e).includes('navigation'));

  beforeEach(() => {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    consoleError.mockRestore();
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
