import {
  inject,
  isDevMode,
  Provider,
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import {
  FirebaseApp,
  FirebaseOptions,
  getApps,
  initializeApp,
} from 'firebase/app';
import {
  AppCheck,
  initializeAppCheck,
  ReCaptchaV3Provider,
} from 'firebase/app-check';
import {
  Analytics,
  getAnalytics,
  setAnalyticsCollectionEnabled,
} from 'firebase/analytics';
import {
  Auth,
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
  Firestore,
  getFirestore,
  initializeFirestore,
} from 'firebase/firestore';
import {
  connectFunctionsEmulator,
  Functions,
  getFunctions,
} from 'firebase/functions';
import {
  getMessaging,
  Messaging,
} from 'firebase/messaging';
import {
  FirebasePerformance,
  getPerformance,
} from 'firebase/performance';
import {
  FirebaseStorage,
  getStorage,
} from 'firebase/storage';
import { FirebaseConfig } from './firebase.config';
import { AppCheckService } from './app-check';
import {
  APP_CHECK_ENABLED,
  APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED,
  APP_CHECK_SITE_KEY,
  FIREBASE_ANALYTICS,
  FIREBASE_APP,
  FIREBASE_APP_CHECK,
  FIREBASE_APP_NAME,
  FIREBASE_AUTH,
  FIREBASE_FIRESTORE,
  FIREBASE_FUNCTIONS,
  FIREBASE_MESSAGING,
  FIREBASE_MESSAGING_VAPID_KEY,
  FIREBASE_OPTIONS,
  FIREBASE_PERFORMANCE,
  FIREBASE_STORAGE,
} from './tokens';

export function FirebaseOptionsTokenFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.options');
}

export function FirebaseNameOrConfigTokenFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.name', null);
}

export function EnablePersistenceTokenFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.firestore.enablePersistence', false);
}

export function PersistenceSettingsTokenFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.firestore.persistenceSettings', null);
}

export function FirestoreSettingsTokenFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.firestore.settings', null);
}

export function FunctionsRegionFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.functions.region', configService.get('firebase.region', null));
}

export function FunctionsOriginFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.functions.origin', configService.get('firebase.origin', null));
}

export function FunctionsNewOriginBehaviorFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.functions.newOriginBehavior');
}

export function InstrumentationEnabledFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.performance.instrumentationEnabled');
}

export function DataCollectionEnabledFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.performance.dataCollectionEnabled');
}

export function VapidKeyFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.messaging.vapid', configService.get('firebase.vapid'));
}

export function AnalyticsEnabledFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.analytics.enabled', null);
}

export function GetAnalyticsAppName(config: ConfigService): string | undefined {
  return config.get('appName');
}

export function UseFirestoreEmulatorFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.emulator.firestore', null);
}

export function UseFunctionsEmulatorFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.emulator.functions', null);
}

export function UseAuthEmulatorFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.emulator.auth', null);
}

export function AuthTenantIdFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.auth.tenantId', null);
}

export function AuthLanguageCodeFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.auth.languageCode', null);
}

export function AuthUseDeviceLanguageFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.auth.useDeviceLanguage', null);
}

export function AuthPersistenceFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.auth.persistence', null);
}

export function AuthSettingsFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.auth.settings', null);
}

export function AppCheckEnabledFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.appCheck.enabled', null);
}

export function AppCheckSiteKeyFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.appCheck.siteKey', null);
}

export function AppIsTokenAutoRefreshEnabledFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.appCheck.isTokenAutoRefreshEnabled', null);
}

export function StorageBucketFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.storage.bucket', configService.get('firebase.storageBucket', null));
}

export function StorageMaxUploadRetryTimeFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.storage.maxUploadRetryTime', null);
}

export function StorageMaxOperationRetryTimeFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.storage.maxOperationRetryTime', null);
}

export function ServiceWorkerFactory() {
  return (typeof navigator !== 'undefined' && navigator.serviceWorker?.getRegistration()) ?? undefined;
}

const DEFAULT_APP_NAME = '[DEFAULT]';

/**
 * Returns the already initialized app with the given name or initializes a new one.
 */
export function FirebaseAppFactory(options: FirebaseOptions, name?: string | null): FirebaseApp {
  const appName = name ?? DEFAULT_APP_NAME;
  return getApps().find(app => app.name === appName) ?? initializeApp(options, appName);
}

export function FirebaseAuthFactory(app: FirebaseApp, config: ConfigService<FirebaseConfig>): Auth {
  const auth = getAuth(app);
  const emulator = UseAuthEmulatorFactory(config);
  if (emulator) {
    connectAuthEmulator(auth, `http://${ emulator[0] }:${ emulator[1] }`);
  }
  const tenantId = AuthTenantIdFactory(config);
  if (tenantId) {
    auth.tenantId = tenantId;
  }
  const languageCode = AuthLanguageCodeFactory(config);
  if (languageCode) {
    auth.languageCode = languageCode;
  }
  if (AuthUseDeviceLanguageFactory(config)) {
    auth.useDeviceLanguage();
  }
  const settings = AuthSettingsFactory(config);
  if (settings) {
    Object.assign(auth.settings, settings);
  }
  const persistence = AuthPersistenceFactory(config);
  if (persistence) {
    const persistenceByName: Record<string, typeof browserLocalPersistence> = {
      local: browserLocalPersistence,
      session: browserSessionPersistence,
      none: inMemoryPersistence,
    };
    const resolved = persistence === true ? browserLocalPersistence : persistenceByName[String(persistence)];
    if (resolved) {
      setPersistence(auth, resolved).catch(error => console.error('Could not set the firebase auth persistence', error));
    } else if (isDevMode()) {
      console.warn(`Unknown firebase auth persistence '${ persistence }'. Use 'local', 'session' or 'none'.`);
    }
  }
  return auth;
}

export function FirebaseFirestoreFactory(app: FirebaseApp, config: ConfigService<FirebaseConfig>): Firestore {
  const settings = FirestoreSettingsTokenFactory(config);
  const firestore = settings ? initializeFirestore(app, settings) : getFirestore(app);
  const emulator = UseFirestoreEmulatorFactory(config);
  if (emulator) {
    connectFirestoreEmulator(firestore, emulator[0], emulator[1]);
  }
  if (EnablePersistenceTokenFactory(config)) {
    enableIndexedDbPersistence(firestore, PersistenceSettingsTokenFactory(config) ?? undefined)
      .catch(error => console.warn('Could not enable the firestore persistence', error));
  }
  return firestore;
}

export function FirebaseFunctionsFactory(app: FirebaseApp, config: ConfigService<FirebaseConfig>): Functions {
  const regionOrCustomDomain = FunctionsRegionFactory(config) ?? FunctionsOriginFactory(config) ?? undefined;
  const functions = getFunctions(app, regionOrCustomDomain);
  const emulator = UseFunctionsEmulatorFactory(config);
  if (emulator) {
    connectFunctionsEmulator(functions, emulator[0], emulator[1]);
  }
  return functions;
}

export function FirebaseStorageFactory(app: FirebaseApp, config: ConfigService<FirebaseConfig>): FirebaseStorage {
  const storage = getStorage(app, StorageBucketFactory(config) ?? undefined);
  const maxUploadRetryTime = StorageMaxUploadRetryTimeFactory(config);
  if (typeof maxUploadRetryTime === 'number') {
    storage.maxUploadRetryTime = maxUploadRetryTime;
  }
  const maxOperationRetryTime = StorageMaxOperationRetryTimeFactory(config);
  if (typeof maxOperationRetryTime === 'number') {
    storage.maxOperationRetryTime = maxOperationRetryTime;
  }
  return storage;
}

/**
 * Returns null if firebase messaging is not supported in the current environment.
 */
export function FirebaseMessagingFactory(app: FirebaseApp): Messaging | null {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }
  try {
    return getMessaging(app);
  } catch (error) {
    if (isDevMode()) {
      console.warn('firebase messaging is not supported in this environment', error);
    }
    return null;
  }
}

/**
 * Returns null if firebase analytics is not available in the current environment.
 */
export function FirebaseAnalyticsFactory(app: FirebaseApp, config: ConfigService<FirebaseConfig>): Analytics | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    const analytics = getAnalytics(app);
    const enabled = AnalyticsEnabledFactory(config);
    if (typeof enabled === 'boolean') {
      setAnalyticsCollectionEnabled(analytics, enabled);
    }
    return analytics;
  } catch (error) {
    if (isDevMode()) {
      console.warn('firebase analytics is not available in this environment', error);
    }
    return null;
  }
}

export function FirebasePerformanceFactory(app: FirebaseApp, config: ConfigService<FirebaseConfig>): FirebasePerformance {
  const performance = getPerformance(app);
  const instrumentationEnabled = InstrumentationEnabledFactory(config);
  if (typeof instrumentationEnabled === 'boolean') {
    performance.instrumentationEnabled = instrumentationEnabled;
  }
  const dataCollectionEnabled = DataCollectionEnabledFactory(config);
  if (typeof dataCollectionEnabled === 'boolean') {
    performance.dataCollectionEnabled = dataCollectionEnabled;
  }
  return performance;
}

/**
 * Returns null if app check is disabled or the site key is missing.
 */
export function FirebaseAppCheckFactory(
  app: FirebaseApp,
  enabled: boolean | null,
  siteKey: string | null,
  isTokenAutoRefreshEnabled: boolean | null,
): AppCheck | null {
  if (!enabled) {
    if (isDevMode()) {
      console.warn('App check is disabled');
    }
    return null;
  }
  if (!siteKey) {
    if (isDevMode()) {
      console.error('The app check site key is not provided');
    }
    return null;
  }
  return initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(siteKey),
    isTokenAutoRefreshEnabled: isTokenAutoRefreshEnabled ?? undefined,
  });
}

export const FIREBASE_APP_PROVIDERS: Provider[] = [
  {
    provide: FIREBASE_OPTIONS,
    useFactory: FirebaseOptionsTokenFactory,
    deps: [ ConfigService ],
  },
  {
    provide: FIREBASE_APP_NAME,
    useFactory: FirebaseNameOrConfigTokenFactory,
    deps: [ ConfigService ],
  },
  {
    provide: FIREBASE_APP,
    useFactory: () => FirebaseAppFactory(inject(FIREBASE_OPTIONS), inject(FIREBASE_APP_NAME, { optional: true })),
  },
];

export const FIREBASE_FIRESTORE_PROVIDERS: Provider[] = [
  {
    provide: FIREBASE_FIRESTORE,
    useFactory: () => FirebaseFirestoreFactory(inject(FIREBASE_APP), inject(ConfigService)),
  },
];

export const FIREBASE_FUNCTIONS_PROVIDERS: Provider[] = [
  {
    provide: FIREBASE_FUNCTIONS,
    useFactory: () => FirebaseFunctionsFactory(inject(FIREBASE_APP), inject(ConfigService)),
  },
];

export const FIREBASE_MESSAGING_PROVIDERS: Provider[] = [
  {
    provide: FIREBASE_MESSAGING_VAPID_KEY,
    useFactory: VapidKeyFactory,
    deps: [ ConfigService ],
  },
  {
    provide: FIREBASE_MESSAGING,
    useFactory: () => FirebaseMessagingFactory(inject(FIREBASE_APP)),
  },
];

export const FIREBASE_PERFORMANCE_PROVIDERS: Provider[] = [
  {
    provide: FIREBASE_PERFORMANCE,
    useFactory: () => FirebasePerformanceFactory(inject(FIREBASE_APP), inject(ConfigService)),
  },
];

export const FIREBASE_ANALYTICS_PROVIDERS: Provider[] = [
  {
    provide: FIREBASE_ANALYTICS,
    useFactory: () => FirebaseAnalyticsFactory(inject(FIREBASE_APP), inject(ConfigService)),
  },
];

export const FIREBASE_AUTH_PROVIDERS: Provider[] = [
  {
    provide: FIREBASE_AUTH,
    useFactory: () => FirebaseAuthFactory(inject(FIREBASE_APP), inject(ConfigService)),
  },
];

export const FIREBASE_APP_CHECK_PROVIDERS: Provider[] = [
  {
    provide: APP_CHECK_ENABLED,
    useFactory: AppCheckEnabledFactory,
    deps: [ ConfigService ],
  },
  {
    provide: APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED,
    useFactory: AppIsTokenAutoRefreshEnabledFactory,
    deps: [ ConfigService ],
  },
  {
    provide: APP_CHECK_SITE_KEY,
    useFactory: AppCheckSiteKeyFactory,
    deps: [ ConfigService ],
  },
  {
    provide: FIREBASE_APP_CHECK,
    useFactory: () => FirebaseAppCheckFactory(
      inject(FIREBASE_APP),
      inject(APP_CHECK_ENABLED, { optional: true }) as boolean | null,
      inject(APP_CHECK_SITE_KEY, { optional: true }) as string | null,
      inject(APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED, { optional: true }) as boolean | null,
    ),
  },
  AppCheckService,
];

export const FIREBASE_STORAGE_PROVIDERS: Provider[] = [
  {
    provide: FIREBASE_STORAGE,
    useFactory: () => FirebaseStorageFactory(inject(FIREBASE_APP), inject(ConfigService)),
  },
];

export const FIREBASE_PROVIDERS: Provider[] = [
  FIREBASE_APP_PROVIDERS,
  FIREBASE_FIRESTORE_PROVIDERS,
  FIREBASE_FUNCTIONS_PROVIDERS,
  FIREBASE_MESSAGING_PROVIDERS,
  FIREBASE_PERFORMANCE_PROVIDERS,
  FIREBASE_ANALYTICS_PROVIDERS,
  FIREBASE_AUTH_PROVIDERS,
  FIREBASE_APP_CHECK_PROVIDERS,
  FIREBASE_STORAGE_PROVIDERS,
];
