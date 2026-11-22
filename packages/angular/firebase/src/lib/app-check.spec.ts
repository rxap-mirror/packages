import { ApplicationInitStatus } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  AppCheckService,
  provideFirebaseAppCheck,
} from './app-check';
import { FIREBASE_APP_CHECK } from './tokens';

const appCheckInstance = { appCheck: true };
const getTokenFn = jest.fn();
const onTokenChangedFn = jest.fn();
const setAutoRefresh = jest.fn();

jest.mock('firebase/app-check', () => ({
  getToken: (...a: unknown[]) => getTokenFn(...a),
  onTokenChanged: (...a: unknown[]) => onTokenChangedFn(...a),
  setTokenAutoRefreshEnabled: (...a: unknown[]) => setAutoRefresh(...a),
}));

describe('AppCheckService', () => {
  function setup(appCheck: unknown | null = null) {
    TestBed.configureTestingModule({
      providers: [
        AppCheckService,
        ...(appCheck === null ? [] : [{ provide: FIREBASE_APP_CHECK, useValue: appCheck }]),
      ],
    });
    return TestBed.inject(AppCheckService);
  }

  beforeEach(() => jest.clearAllMocks());

  describe('without an app check instance (disabled or not configured)', () => {
    it('rejects the token request and ignores the auto refresh flag', async () => {
      const s = setup();
      await expect(s.getToken()).rejects.toThrow('not initialized');
      s.setTokenAutoRefreshEnabled(true);
      expect(setAutoRefresh).not.toHaveBeenCalled();
    });

    it('exposes an empty token changes stream', () => {
      let completed = false;
      setup().onTokenChanged$.subscribe({ complete: () => (completed = true) });
      expect(completed).toBe(true);
      expect(onTokenChangedFn).not.toHaveBeenCalled();
    });

    it('also works when the token is provided as null', async () => {
      TestBed.configureTestingModule({ providers: [ AppCheckService, { provide: FIREBASE_APP_CHECK, useValue: null } ] });
      await expect(TestBed.inject(AppCheckService).getToken()).rejects.toThrow('not initialized');
    });
  });

  describe('with an app check instance', () => {
    let s: AppCheckService;
    beforeEach(() => {
      s = setup(appCheckInstance);
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
      const [ instance, next, err ] = onTokenChangedFn.mock.calls[0];
      expect(instance).toBe(appCheckInstance);
      next({ token: 't' });
      expect(values).toEqual([ { token: 't' } ]);
      err('bad');
      expect(error).toBe('bad');
      expect(completed).toBe(false);
    });
  });

  it('provideFirebaseAppCheck eagerly creates the service', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideFirebaseAppCheck(),
        { provide: FIREBASE_APP_CHECK, useValue: appCheckInstance },
      ],
    });
    await TestBed.inject(ApplicationInitStatus).donePromise;
    // the service subscribes lazily, so nothing is requested from firebase by the eager instantiation
    expect(getTokenFn).not.toHaveBeenCalled();
    expect(TestBed.inject(AppCheckService)).toBeInstanceOf(AppCheckService);
  });
});
