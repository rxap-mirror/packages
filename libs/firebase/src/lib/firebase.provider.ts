import {
  Provider,
  Optional,
  NgZone
} from '@angular/core';
import {
  INSTRUMENTATION_ENABLED,
  DATA_COLLECTION_ENABLED
} from '@angular/fire/performance';
import { ConfigService } from '@rxap/config';
import { FirebaseConfig } from './firebase.config';
import {
  FIREBASE_OPTIONS,
  FIREBASE_APP_NAME,
  FirebaseApp,
  ɵfirebaseAppFactory
} from '@angular/fire';
import {
  ENABLE_PERSISTENCE,
  PERSISTENCE_SETTINGS,
  SETTINGS as FIRESTORE_SETTINGS,
  USE_EMULATOR as USE_FIRESTORE_EMULATOR
} from '@angular/fire/firestore';
import {
  REGION,
  ORIGIN,
  NEW_ORIGIN_BEHAVIOR,
  USE_EMULATOR as USE_FUNCTIONS_EMULATOR
} from '@angular/fire/functions';
import {
  VAPID_KEY,
  SERVICE_WORKER
} from '@angular/fire/messaging';
import {
  USE_EMULATOR as USE_AUTH_EMULATOR,
  TENANT_ID,
  LANGUAGE_CODE,
  USE_DEVICE_LANGUAGE,
  PERSISTENCE,
  SETTINGS as AUTH_SETTINGS
} from '@angular/fire/auth';
import {
  COLLECTION_ENABLED,
  APP_NAME
} from '@angular/fire/analytics';

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
    provide:    NEW_ORIGIN_BEHAVIOR,
    useFactory: FunctionsNewOriginBehaviorFactory,
    deps:       [ ConfigService ]
  },
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

export const FIREBASE_PROVIDERS: Provider[] = [
  FIREBASE_APP_PROVIDERS,
  FIREBASE_FIRESTORE_PROVIDERS,
  FIREBASE_FUNCTIONS_PROVIDERS,
  FIREBASE_MESSAGING_PROVIDERS,
  FIREBASE_PERFORMANCE_PROVIDERS,
  FIREBASE_ANALYTICS_PROVIDERS,
  FIREBASE_AUTH_PROVIDERS
];
