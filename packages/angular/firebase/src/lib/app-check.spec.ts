import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FIREBASE_APP_NAME, FIREBASE_OPTIONS } from '@angular/fire/compat';
import { ConfigService } from '@rxap/config';
import { AppCheckService, provideAngularFireAppCheck } from './app-check';
import { APP_CHECK_ENABLED, APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED, APP_CHECK_SITE_KEY } from './tokens';

const appCheckInstance = { activate: jest.fn() };
const factory = jest.fn();
const getTokenFn = jest.fn();
const onTokenChangedFn = jest.fn();
const setAutoRefresh = jest.fn();

jest.mock('@angular/fire/compat', () => ({
  ...jest.requireActual('@angular/fire/compat'),
  ɵfirebaseAppFactory: (...a: unknown[]) => factory(...a),
}));
jest.mock('@angular/fire/app-check', () => ({
  AppCheck: class {},
  getToken: (...a: unknown[]) => getTokenFn(...a),
  onTokenChanged: (...a: unknown[]) => onTokenChangedFn(...a),
  setTokenAutoRefreshEnabled: (...a: unknown[]) => setAutoRefresh(...a),
}));

describe('AppCheckService', () => {
  function setup(extra: any[] = []) {
    TestBed.configureTestingModule({
      providers: [
        AppCheckService,
        { provide: ConfigService, useValue: {} },
        { provide: FIREBASE_OPTIONS, useValue: { apiKey: 'k' } },
        { provide: FIREBASE_APP_NAME, useValue: 'app' },
        ...extra,
      ],
    });
    return TestBed.inject(AppCheckService);
  }

  beforeEach(() => {
    jest.clearAllMocks();
    factory.mockReturnValue({ appCheck: () => appCheckInstance });
    jest.spyOn(console, 'warn').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
  });
  afterEach(() => jest.restoreAllMocks());

  it('warns and rejects when disabled', async () => {
    const s = setup();
    expect(console.warn).toHaveBeenCalledWith('App check is disabled');
    await expect(s.getToken()).rejects.toThrow('not initialized');
    s.setTokenAutoRefreshEnabled(true);
    expect(setAutoRefresh).not.toHaveBeenCalled();
    expect(factory).not.toHaveBeenCalled();
  });

  it('errors when enabled without site key', async () => {
    const s = setup([{ provide: APP_CHECK_ENABLED, useValue: true }]);
    expect(console.error).toHaveBeenCalledWith('The app check site key is not provided');
    await expect(s.getToken()).rejects.toThrow();
  });

  it('activates app check with the site key and auto refresh', () => {
    setup([
      { provide: APP_CHECK_ENABLED, useValue: true },
      { provide: APP_CHECK_SITE_KEY, useValue: 'site' },
      { provide: APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED, useValue: true },
    ]);
    expect(factory).toHaveBeenCalledWith({ apiKey: 'k' }, expect.anything(), 'app');
    expect(appCheckInstance.activate).toHaveBeenCalledWith('site', true);
  });

  it('activates with undefined auto refresh when not provided', () => {
    setup([
      { provide: APP_CHECK_ENABLED, useValue: true },
      { provide: APP_CHECK_SITE_KEY, useValue: 'site' },
    ]);
    expect(appCheckInstance.activate).toHaveBeenCalledWith('site', undefined);
  });

  describe('when active', () => {
    let s: AppCheckService;
    beforeEach(() => {
      s = setup([
        { provide: APP_CHECK_ENABLED, useValue: true },
        { provide: APP_CHECK_SITE_KEY, useValue: 'site' },
      ]);
    });

    it('getToken returns the token string', async () => {
      getTokenFn.mockResolvedValue({ token: 'abc' });
      await expect(s.getToken(true)).resolves.toBe('abc');
      expect(getTokenFn).toHaveBeenCalledWith(appCheckInstance, true);
    });

    it('delegates auto refresh', () => {
      s.setTokenAutoRefreshEnabled(false);
      expect(setAutoRefresh).toHaveBeenCalledWith(appCheckInstance, false);
    });

    it('exposes token changes as a shared observable', () => {
      const values: unknown[] = [];
      let error: unknown;
      let completed = false;
      s.onTokenChanged$.subscribe({ next: (v) => values.push(v), error: (e) => (error = e), complete: () => (completed = true) });
      s.onTokenChanged$.subscribe();
      expect(onTokenChangedFn).toHaveBeenCalledTimes(1);
      const [, next, err] = onTokenChangedFn.mock.calls[0];
      next({ token: 't' });
      expect(values).toEqual([{ token: 't' }]);
      err('bad');
      expect(error).toBe('bad');
      expect(completed).toBe(false);
    });
  });

  it('provideAngularFireAppCheck eagerly creates the service', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideAngularFireAppCheck(),
        { provide: ConfigService, useValue: {} },
        { provide: FIREBASE_OPTIONS, useValue: {} },
      ],
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    expect(console.warn).toHaveBeenCalledWith('App check is disabled');
  });
});
