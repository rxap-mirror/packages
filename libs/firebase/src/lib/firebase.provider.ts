import {
  Provider,
  Optional,
  NgZone
} from '@angular/core';
import {
  AUTOMATICALLY_TRACE_CORE_NG_METRICS,
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
  SETTINGS
} from '@angular/fire/firestore';
import {
  REGION,
  ORIGIN
} from '@angular/fire/functions';

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
  return configService.get('firebase.region', null);
}

export function FunctionsOriginFactory(configService: ConfigService<FirebaseConfig>) {
  return configService.get('firebase.origin', null);
}

export function AutomaticallyTraceCoreNgMetricsFactory(configService: ConfigService<FirebaseConfig>) {
  return true;
}

export function InstrumentationEnabledFactory(configService: ConfigService<FirebaseConfig>) {
  return true;
}

export function DataCollectionEnabledFactory(configService: ConfigService<FirebaseConfig>) {
  return true;
}

export const FIREBASE_PROVIDERS: Provider[] = [
  {
    provide:    AUTOMATICALLY_TRACE_CORE_NG_METRICS,
    useFactory: AutomaticallyTraceCoreNgMetricsFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    INSTRUMENTATION_ENABLED,
    useFactory: InstrumentationEnabledFactory,
    deps:       [ ConfigService ]
  },
  {
    provide:    DATA_COLLECTION_ENABLED,
    useFactory: DataCollectionEnabledFactory,
    deps:       [ ConfigService ]
  },
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
    provide:    SETTINGS,
    useFactory: FirestoreSettingsTokenFactory,
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
    provide:    FirebaseApp,
    useFactory: ɵfirebaseAppFactory,
    deps:       [
      FIREBASE_OPTIONS,
      NgZone,
      [new Optional(), FIREBASE_APP_NAME]
    ]
  }
];
