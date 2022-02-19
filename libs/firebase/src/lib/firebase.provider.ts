import {
  Provider,
  Optional,
  NgZone
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import { FirebaseConfig } from './firebase.config';
import {
  APP_CHECK_ENABLED,
  APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED,
  APP_CHECK_SITE_KEY,
  AppCheckService
} from './app-check';
import { FirebaseApp } from '@angular/fire/app';
import {
  USE_DEVICE_LANGUAGE,
  PERSISTENCE,
  LANGUAGE_CODE,
  TENANT_ID,
  USE_EMULATOR as USE_AUTH_EMULATOR,
  SETTINGS as AUTH_SETTINGS
} from '@angular/fire/compat/auth';
import {
  ɵfirebaseAppFactory,
  FIREBASE_APP_NAME,
  FIREBASE_OPTIONS
} from '@angular/fire/compat';
import {
  DATA_COLLECTION_ENABLED,
  INSTRUMENTATION_ENABLED
} from '@angular/fire/compat/performance';
import {
  BUCKET,
  MAX_UPLOAD_RETRY_TIME,
  MAX_OPERATION_RETRY_TIME
} from '@angular/fire/compat/storage';
import {
  APP_NAME,
  COLLECTION_ENABLED
} from '@angular/fire/compat/analytics';
import {
  SERVICE_WORKER,
  VAPID_KEY
} from '@angular/fire/compat/messaging';
import {
  PERSISTENCE_SETTINGS,
  ENABLE_PERSISTENCE,
  SETTINGS as FIRESTORE_SETTINGS,
  USE_EMULATOR as USE_FIRESTORE_EMULATOR
} from '@angular/fire/compat/firestore';
import {
  ORIGIN,
  REGION,
  USE_EMULATOR as USE_FUNCTIONS_EMULATOR
} from '@angular/fire/compat/functions';

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

export const FIREBASE_APP_PROVIDERS: Provider[] = [
  {
    provide:    FIREBASE_OPTIONS,
    useFactory: FirebaseOptionsTokenFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    FIREBASE_APP_NAME,
    useFactory: FirebaseNameOrConfigTokenFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    FirebaseApp,
    useFactory: ɵfirebaseAppFactory,
    deps:       [
      FIREBASE_OPTIONS,
      NgZone,
      [ new Optional(), FIREBASE_APP_NAME ]
    ]
  }
];

export const FIREBASE_FIRESTORE_PROVIDERS: Provider[] = [
  {
    provide:    ENABLE_PERSISTENCE,
    useFactory: EnablePersistenceTokenFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    PERSISTENCE_SETTINGS,
    useFactory: PersistenceSettingsTokenFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    FIRESTORE_SETTINGS,
    useFactory: FirestoreSettingsTokenFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    USE_FIRESTORE_EMULATOR,
    useFactory: UseFirestoreEmulatorFactory,
    deps:       [ ConfigService ]
  }
];

export const FIREBASE_FUNCTIONS_PROVIDERS: Provider[] = [
  {
    provide:    REGION,
    useFactory: FunctionsRegionFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    ORIGIN,
    useFactory: FunctionsOriginFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    USE_FUNCTIONS_EMULATOR,
    useFactory: UseFunctionsEmulatorFactory,
    deps:       [ ConfigService ]
  }
];

export const FIREBASE_MESSAGING_PROVIDERS: Provider[] = [
  {
    provide:    VAPID_KEY,
    useFactory: VapidKeyFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    SERVICE_WORKER,
    useFactory: ServiceWorkerFactory,
    deps:       []
  }
];

export const FIREBASE_PERFORMANCE_PROVIDERS: Provider[] = [
  {
    provide:    INSTRUMENTATION_ENABLED,
    useFactory: InstrumentationEnabledFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    DATA_COLLECTION_ENABLED,
    useFactory: DataCollectionEnabledFactory,
    deps:       [ ConfigService ]
  }
];

export const FIREBASE_ANALYTICS_PROVIDERS: Provider[] = [
  {
    provide:    COLLECTION_ENABLED,
    useFactory: AnalyticsEnabledFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    APP_NAME,
    useFactory: GetAnalyticsAppName,
    deps:       [ ConfigService ]
  }
];

export const FIREBASE_AUTH_PROVIDERS: Provider[] = [
  {
    provide:    USE_AUTH_EMULATOR,
    useFactory: UseAuthEmulatorFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    TENANT_ID,
    useFactory: AuthTenantIdFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    LANGUAGE_CODE,
    useFactory: AuthLanguageCodeFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    USE_DEVICE_LANGUAGE,
    useFactory: AuthUseDeviceLanguageFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    PERSISTENCE,
    useFactory: AuthPersistenceFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    AUTH_SETTINGS,
    useFactory: AuthSettingsFactory,
    deps:       [ ConfigService ]
  }
];

export const FIREBASE_APP_CHECK_PROVIDERS: Provider[] = [
  {
    provide:    APP_CHECK_ENABLED,
    useFactory: AppCheckEnabledFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED,
    useFactory: AppIsTokenAutoRefreshEnabledFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    APP_CHECK_SITE_KEY,
    useFactory: AppCheckSiteKeyFactory,
    deps:       [ ConfigService ]
  },
  AppCheckService,
];

export const FIREBASE_STORAGE_PROVIDERS: Provider[] = [
  {
    provide:    BUCKET,
    useFactory: StorageBucketFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    MAX_UPLOAD_RETRY_TIME,
    useFactory: StorageMaxUploadRetryTimeFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    MAX_OPERATION_RETRY_TIME,
    useFactory: StorageMaxOperationRetryTimeFactory,
    deps:       [ ConfigService ]
  }
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
  FIREBASE_STORAGE_PROVIDERS
];
