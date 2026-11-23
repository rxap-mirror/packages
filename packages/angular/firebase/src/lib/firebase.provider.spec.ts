import type { Mock } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ConfigService } from '@rxap/config';
import { getAnalytics, setAnalyticsCollectionEnabled } from 'firebase/analytics';
import { getApps, initializeApp } from 'firebase/app';
import { initializeAppCheck } from 'firebase/app-check';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  connectAuthEmulator,
  getAuth,
  inMemoryPersistence,
  setPersistence,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  enableIndexedDbPersistence,
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { getMessaging } from 'firebase/messaging';
import { getPerformance } from 'firebase/performance';
import { getStorage } from 'firebase/storage';
import * as p from './firebase.provider';
import { FIREBASE_APP, FIREBASE_APP_NAME, FIREBASE_OPTIONS } from './tokens';

vi.mock('firebase/app', () => ({ getApps: vi.fn(() => []), initializeApp: vi.fn((options, name) => ({ name, options })) }));
vi.mock('firebase/app-check', () => ({
  initializeAppCheck: vi.fn(() => ({ appCheck: true })),
  ReCaptchaV3Provider: class { constructor(public siteKey: string) {} },
}));
vi.mock('firebase/analytics', () => ({ getAnalytics: vi.fn(() => ({ analytics: true })), setAnalyticsCollectionEnabled: vi.fn() }));
vi.mock('firebase/auth', () => ({
  browserLocalPersistence: { type: 'LOCAL' },
  browserSessionPersistence: { type: 'SESSION' },
  inMemoryPersistence: { type: 'NONE' },
  connectAuthEmulator: vi.fn(),
  getAuth: vi.fn(),
  setPersistence: vi.fn(() => Promise.resolve()),
}));
vi.mock('firebase/firestore', () => ({
  connectFirestoreEmulator: vi.fn(),
  enableIndexedDbPersistence: vi.fn(() => Promise.resolve()),
  getFirestore: vi.fn(() => ({ default: true })),
  initializeFirestore: vi.fn(() => ({ custom: true })),
}));
vi.mock('firebase/functions', () => ({ connectFunctionsEmulator: vi.fn(), getFunctions: vi.fn(() => ({ functions: true })) }));
vi.mock('firebase/messaging', () => ({ getMessaging: vi.fn(() => ({ messaging: true })) }));
vi.mock('firebase/performance', () => ({ getPerformance: vi.fn() }));
vi.mock('firebase/storage', () => ({ getStorage: vi.fn() }));

function config(values: Record<string, unknown>) {
  return {
    get: vi.fn((key: string, def?: unknown) => (key in values ? values[key] : def)),
  } as unknown as ConfigService<any>;
}

describe('firebase provider factories', () => {
  it.each([
    ['FirebaseOptionsTokenFactory', 'firebase.options', undefined],
    ['FirebaseNameOrConfigTokenFactory', 'firebase.name', null],
    ['EnablePersistenceTokenFactory', 'firebase.firestore.enablePersistence', false],
    ['PersistenceSettingsTokenFactory', 'firebase.firestore.persistenceSettings', null],
    ['FirestoreSettingsTokenFactory', 'firebase.firestore.settings', null],
    ['InstrumentationEnabledFactory', 'firebase.performance.instrumentationEnabled', undefined],
    ['DataCollectionEnabledFactory', 'firebase.performance.dataCollectionEnabled', undefined],
    ['FunctionsNewOriginBehaviorFactory', 'firebase.functions.newOriginBehavior', undefined],
    ['AnalyticsEnabledFactory', 'firebase.analytics.enabled', null],
    ['UseFirestoreEmulatorFactory', 'firebase.emulator.firestore', null],
    ['UseFunctionsEmulatorFactory', 'firebase.emulator.functions', null],
    ['UseAuthEmulatorFactory', 'firebase.emulator.auth', null],
    ['AuthTenantIdFactory', 'firebase.auth.tenantId', null],
    ['AuthLanguageCodeFactory', 'firebase.auth.languageCode', null],
    ['AuthUseDeviceLanguageFactory', 'firebase.auth.useDeviceLanguage', null],
    ['AuthPersistenceFactory', 'firebase.auth.persistence', null],
    ['AuthSettingsFactory', 'firebase.auth.settings', null],
    ['AppCheckEnabledFactory', 'firebase.appCheck.enabled', null],
    ['AppCheckSiteKeyFactory', 'firebase.appCheck.siteKey', null],
    ['AppIsTokenAutoRefreshEnabledFactory', 'firebase.appCheck.isTokenAutoRefreshEnabled', null],
    ['StorageMaxUploadRetryTimeFactory', 'firebase.storage.maxUploadRetryTime', null],
    ['StorageMaxOperationRetryTimeFactory', 'firebase.storage.maxOperationRetryTime', null],
  ])('%s reads %s', (name, key, def) => {
    const fn = (p as any)[name];
    expect(fn(config({ [key]: 'v' }))).toBe('v');
    expect(fn(config({}))).toBe(def);
  });

  it('region, origin, vapid and bucket fall back to deprecated keys', () => {
    expect(p.FunctionsRegionFactory(config({ 'firebase.region': 'eu' }))).toBe('eu');
    expect(p.FunctionsRegionFactory(config({ 'firebase.functions.region': 'us', 'firebase.region': 'eu' }))).toBe('us');
    expect(p.FunctionsRegionFactory(config({}))).toBeNull();
    expect(p.FunctionsOriginFactory(config({ 'firebase.origin': 'o' }))).toBe('o');
    expect(p.FunctionsOriginFactory(config({}))).toBeNull();
    expect(p.VapidKeyFactory(config({ 'firebase.vapid': 'v' }))).toBe('v');
    expect(p.VapidKeyFactory(config({ 'firebase.messaging.vapid': 'm', 'firebase.vapid': 'v' }))).toBe('m');
    expect(p.StorageBucketFactory(config({ 'firebase.storageBucket': 'b' }))).toBe('b');
    expect(p.StorageBucketFactory(config({ 'firebase.storage.bucket': 'n' }))).toBe('n');
    expect(p.StorageBucketFactory(config({}))).toBeNull();
  });

  it('GetAnalyticsAppName reads appName', () => {
    expect(p.GetAnalyticsAppName(config({ appName: 'x' }) as any)).toBe('x');
  });

  it('ServiceWorkerFactory resolves the registration when available', async () => {
    const reg = {};
    const original = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: { getRegistration: () => Promise.resolve(reg) },
    });
    await expect(p.ServiceWorkerFactory()).resolves.toBe(reg);
    Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: undefined });
    expect(p.ServiceWorkerFactory()).toBeUndefined();
    if (original) Object.defineProperty(navigator, 'serviceWorker', original);
    else delete (navigator as any).serviceWorker;
  });

  it('provider lists are well formed and aggregated', () => {
    const lists = [
      p.FIREBASE_APP_PROVIDERS,
      p.FIREBASE_FIRESTORE_PROVIDERS,
      p.FIREBASE_FUNCTIONS_PROVIDERS,
      p.FIREBASE_MESSAGING_PROVIDERS,
      p.FIREBASE_PERFORMANCE_PROVIDERS,
      p.FIREBASE_ANALYTICS_PROVIDERS,
      p.FIREBASE_AUTH_PROVIDERS,
      p.FIREBASE_APP_CHECK_PROVIDERS,
      p.FIREBASE_STORAGE_PROVIDERS,
    ];
    expect(p.FIREBASE_PROVIDERS).toEqual(lists);
    for (const list of lists) {
      expect(list.length).toBeGreaterThan(0);
      for (const provider of list as any[]) {
        if (typeof provider === 'function') continue;
        expect(provider.provide).toBeDefined();
        expect(typeof provider.useFactory).toBe('function');
      }
    }
  });
});

describe('firebase instance factories', () => {
  const app: any = { name: '[DEFAULT]', options: {} };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => vi.restoreAllMocks());

  describe('FirebaseAppFactory', () => {
    it('initializes the default app', () => {
      const result = p.FirebaseAppFactory({ apiKey: 'k', projectId: 'p' });
      expect(initializeApp).toHaveBeenCalledWith({ apiKey: 'k', projectId: 'p' }, '[DEFAULT]');
      expect(result.name).toBe('[DEFAULT]');
    });

    it('initializes a named app', () => {
      p.FirebaseAppFactory({ apiKey: 'k', projectId: 'p' }, 'named');
      expect(initializeApp).toHaveBeenCalledWith({ apiKey: 'k', projectId: 'p' }, 'named');
    });

    it('reuses an app that is already initialized', () => {
      const existing = { name: 'named' };
      (getApps as Mock).mockReturnValueOnce([ existing ]);
      expect(p.FirebaseAppFactory({ apiKey: 'k', projectId: 'p' }, 'named')).toBe(existing);
      expect(initializeApp).not.toHaveBeenCalled();
    });
  });

  describe('FirebaseAuthFactory', () => {
    let auth: any;
    beforeEach(() => {
      auth = { settings: {}, useDeviceLanguage: vi.fn() };
      (getAuth as Mock).mockReturnValue(auth);
    });

    it('returns the plain auth instance without configuration', () => {
      expect(p.FirebaseAuthFactory(app, config({}))).toBe(auth);
      expect(connectAuthEmulator).not.toHaveBeenCalled();
      expect(setPersistence).not.toHaveBeenCalled();
    });

    it('applies the configuration', () => {
      p.FirebaseAuthFactory(app, config({
        'firebase.emulator.auth': [ 'localhost', 9099 ],
        'firebase.auth.tenantId': 'tenant',
        'firebase.auth.languageCode': 'de',
        'firebase.auth.useDeviceLanguage': true,
        'firebase.auth.settings': { appVerificationDisabledForTesting: true },
      }));
      expect(connectAuthEmulator).toHaveBeenCalledWith(auth, 'http://localhost:9099');
      expect(auth.tenantId).toBe('tenant');
      expect(auth.languageCode).toBe('de');
      expect(auth.useDeviceLanguage).toHaveBeenCalled();
      expect(auth.settings).toEqual({ appVerificationDisabledForTesting: true });
    });

    it.each([
      [ 'local', browserLocalPersistence ],
      [ 'session', browserSessionPersistence ],
      [ 'none', inMemoryPersistence ],
      [ true, browserLocalPersistence ],
    ])('maps the persistence %s', (value, expected) => {
      p.FirebaseAuthFactory(app, config({ 'firebase.auth.persistence': value }));
      expect(setPersistence).toHaveBeenCalledWith(auth, expected);
    });

    it('warns about an unknown persistence', () => {
      p.FirebaseAuthFactory(app, config({ 'firebase.auth.persistence': 'bogus' }));
      expect(setPersistence).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalled();
    });
  });

  describe('FirebaseFirestoreFactory', () => {
    it('uses getFirestore without settings', () => {
      expect(p.FirebaseFirestoreFactory(app, config({}))).toEqual({ default: true });
      expect(initializeFirestore).not.toHaveBeenCalled();
      expect(enableIndexedDbPersistence).not.toHaveBeenCalled();
    });

    it('uses initializeFirestore with settings, the emulator and the persistence', () => {
      const result = p.FirebaseFirestoreFactory(app, config({
        'firebase.firestore.settings': { ignoreUndefinedProperties: true },
        'firebase.emulator.firestore': [ 'localhost', 8080 ],
        'firebase.firestore.enablePersistence': true,
        'firebase.firestore.persistenceSettings': { forceOwnership: true },
      }));
      expect(result).toEqual({ custom: true });
      expect(initializeFirestore).toHaveBeenCalledWith(app, { ignoreUndefinedProperties: true });
      expect(getFirestore).not.toHaveBeenCalled();
      expect(connectFirestoreEmulator).toHaveBeenCalledWith(result, 'localhost', 8080);
      expect(enableIndexedDbPersistence).toHaveBeenCalledWith(result, { forceOwnership: true });
    });
  });

  describe('FirebaseFunctionsFactory', () => {
    it('prefers the region over the origin', () => {
      p.FirebaseFunctionsFactory(app, config({ 'firebase.functions.region': 'eu', 'firebase.functions.origin': 'o' }));
      expect(getFunctions).toHaveBeenCalledWith(app, 'eu');
    });

    it('falls back to the origin and connects the emulator', () => {
      const result = p.FirebaseFunctionsFactory(app, config({
        'firebase.functions.origin': 'https://f.example.com',
        'firebase.emulator.functions': [ 'localhost', 5001 ],
      }));
      expect(getFunctions).toHaveBeenCalledWith(app, 'https://f.example.com');
      expect(connectFunctionsEmulator).toHaveBeenCalledWith(result, 'localhost', 5001);
    });

    it('uses the default region without configuration', () => {
      p.FirebaseFunctionsFactory(app, config({}));
      expect(getFunctions).toHaveBeenCalledWith(app, undefined);
    });
  });

  describe('FirebaseStorageFactory', () => {
    it('configures the bucket and the retry times', () => {
      const storage: any = {};
      (getStorage as Mock).mockReturnValue(storage);
      expect(p.FirebaseStorageFactory(app, config({
        'firebase.storage.bucket': 'gs://b',
        'firebase.storage.maxUploadRetryTime': 1000,
        'firebase.storage.maxOperationRetryTime': 2000,
      }))).toBe(storage);
      expect(getStorage).toHaveBeenCalledWith(app, 'gs://b');
      expect(storage.maxUploadRetryTime).toBe(1000);
      expect(storage.maxOperationRetryTime).toBe(2000);
    });

    it('keeps the sdk defaults without configuration', () => {
      const storage: any = {};
      (getStorage as Mock).mockReturnValue(storage);
      p.FirebaseStorageFactory(app, config({}));
      expect(getStorage).toHaveBeenCalledWith(app, undefined);
      expect(storage).toEqual({});
    });
  });

  describe('FirebaseMessagingFactory', () => {
    const original = Object.getOwnPropertyDescriptor(navigator, 'serviceWorker');
    afterEach(() => {
      if (original) Object.defineProperty(navigator, 'serviceWorker', original);
      else delete (navigator as any).serviceWorker;
    });

    it('returns null if service workers are not supported', () => {
      delete (navigator as any).serviceWorker;
      expect(p.FirebaseMessagingFactory(app)).toBeNull();
      expect(getMessaging).not.toHaveBeenCalled();
    });

    it('returns the messaging instance', () => {
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: {} });
      expect(p.FirebaseMessagingFactory(app)).toEqual({ messaging: true });
    });

    it('returns null if the sdk reports the environment as unsupported', () => {
      Object.defineProperty(navigator, 'serviceWorker', { configurable: true, value: {} });
      (getMessaging as Mock).mockImplementationOnce(() => {
        throw new Error('unsupported');
      });
      expect(p.FirebaseMessagingFactory(app)).toBeNull();
    });
  });

  describe('FirebaseAnalyticsFactory', () => {
    it('applies the collection flag', () => {
      expect(p.FirebaseAnalyticsFactory(app, config({ 'firebase.analytics.enabled': false }))).toEqual({ analytics: true });
      expect(setAnalyticsCollectionEnabled).toHaveBeenCalledWith({ analytics: true }, false);
    });

    it('does not touch the collection flag when it is not configured', () => {
      p.FirebaseAnalyticsFactory(app, config({}));
      expect(setAnalyticsCollectionEnabled).not.toHaveBeenCalled();
    });

    it('returns null if analytics is not available', () => {
      (getAnalytics as Mock).mockImplementationOnce(() => {
        throw new Error('unavailable');
      });
      expect(p.FirebaseAnalyticsFactory(app, config({}))).toBeNull();
    });
  });

  describe('FirebasePerformanceFactory', () => {
    it('applies the configured flags', () => {
      const performance: any = {};
      (getPerformance as Mock).mockReturnValue(performance);
      p.FirebasePerformanceFactory(app, config({
        'firebase.performance.instrumentationEnabled': false,
        'firebase.performance.dataCollectionEnabled': true,
      }));
      expect(performance).toEqual({ instrumentationEnabled: false, dataCollectionEnabled: true });
    });

    it('leaves the flags untouched without configuration', () => {
      const performance: any = {};
      (getPerformance as Mock).mockReturnValue(performance);
      p.FirebasePerformanceFactory(app, config({}));
      expect(performance).toEqual({});
    });
  });

  describe('FirebaseAppCheckFactory', () => {
    it('returns null and warns when disabled', () => {
      expect(p.FirebaseAppCheckFactory(app, null, 'site', null)).toBeNull();
      expect(console.warn).toHaveBeenCalledWith('App check is disabled');
      expect(initializeAppCheck).not.toHaveBeenCalled();
    });

    it('returns null and errors when enabled without site key', () => {
      expect(p.FirebaseAppCheckFactory(app, true, null, null)).toBeNull();
      expect(console.error).toHaveBeenCalledWith('The app check site key is not provided');
    });

    it('initializes app check with the reCAPTCHA v3 provider', () => {
      expect(p.FirebaseAppCheckFactory(app, true, 'site', true)).toEqual({ appCheck: true });
      const [ calledApp, options ] = (initializeAppCheck as Mock).mock.calls[0];
      expect(calledApp).toBe(app);
      expect(options.provider.siteKey).toBe('site');
      expect(options.isTokenAutoRefreshEnabled).toBe(true);
    });

    it('passes undefined for the auto refresh flag when it is not configured', () => {
      p.FirebaseAppCheckFactory(app, true, 'site', null);
      expect((initializeAppCheck as Mock).mock.calls[0][1].isTokenAutoRefreshEnabled).toBeUndefined();
    });
  });

  it('FIREBASE_APP is created from the configured options and name', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigService, useValue: config({ 'firebase.options': { apiKey: 'k', projectId: 'p' }, 'firebase.name': 'configured' }) },
        p.FIREBASE_APP_PROVIDERS,
      ],
    });
    expect(TestBed.inject(FIREBASE_OPTIONS)).toEqual({ apiKey: 'k', projectId: 'p' });
    expect(TestBed.inject(FIREBASE_APP_NAME)).toBe('configured');
    expect(TestBed.inject(FIREBASE_APP).name).toBe('configured');
  });
});
