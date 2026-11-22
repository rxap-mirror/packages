import { HttpClient, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppCheck } from '@angular/fire/app-check';
import {
  FIREBASE_APP_CHECK_HTTP_INTERCEPTOR,
  FirebaseAppCheckHttpInterceptor,
} from './firebase-app-check.http-interceptor';
import { APP_CHECK_ENABLED, FIREBASE_APP_CHECK_HTTP_INTERCEPTOR_URL_PATTERN } from './tokens';

const getTokenFn = jest.fn();
jest.mock('@angular/fire/app-check', () => ({
  AppCheck: class {},
  getToken: (...a: unknown[]) => getTokenFn(...a),
}));

describe('FirebaseAppCheckHttpInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;

  function setup(enabled: boolean | null, pattern: RegExp | RegExp[]) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        FIREBASE_APP_CHECK_HTTP_INTERCEPTOR,
        { provide: AppCheck, useValue: { id: 'ac' } },
        { provide: FIREBASE_APP_CHECK_HTTP_INTERCEPTOR_URL_PATTERN, useValue: pattern },
        ...(enabled === null ? [] : [{ provide: APP_CHECK_ENABLED, useValue: enabled }]),
      ],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => getTokenFn.mockReset().mockResolvedValue({ token: 'tok' }));
  afterEach(() => ctrl.verify());

  it('adds the app check header for matching urls', async () => {
    setup(true, /\/api\//);
    http.get('/api/x').subscribe();
    await Promise.resolve();
    await Promise.resolve();
    const req = ctrl.expectOne('/api/x');
    expect(req.request.headers.get('X-Firebase-AppCheck')).toBe('tok');
    expect(getTokenFn).toHaveBeenCalledWith({ id: 'ac' });
    req.flush({});
  });

  it('supports multiple patterns and skips non matching urls', () => {
    setup(true, [/\/a\//, /\/b\//]);
    http.get('/other').subscribe();
    const req = ctrl.expectOne('/other');
    expect(req.request.headers.has('X-Firebase-AppCheck')).toBe(false);
    expect(getTokenFn).not.toHaveBeenCalled();
    req.flush({});
  });

  it('passes through when disabled', () => {
    setup(false, /.*/);
    http.get('/api/x').subscribe();
    const req = ctrl.expectOne('/api/x');
    expect(req.request.headers.has('X-Firebase-AppCheck')).toBe(false);
    req.flush({});
  });

  it('is provided as a multi HTTP interceptor', () => {
    expect(FIREBASE_APP_CHECK_HTTP_INTERCEPTOR).toMatchObject({ multi: true, useClass: FirebaseAppCheckHttpInterceptor });
  });
});
