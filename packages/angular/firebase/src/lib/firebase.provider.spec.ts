import { ConfigService } from '@rxap/config';
import * as p from './firebase.provider';

function config(values: Record<string, unknown>) {
  return {
    get: jest.fn((key: string, def?: unknown) => (key in values ? values[key] : def)),
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
