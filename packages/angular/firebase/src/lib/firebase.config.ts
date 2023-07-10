import type {
  FirestoreSettings,
  PersistenceSettings,
} from '@firebase/firestore';
import type { AuthSettings } from '@firebase/auth';

export interface FirebaseConfig {
  firebase: null | {
    name: string | null;
    options: {
      apiKey: string;
      authDomain?: string;
      databaseURL?: string;
      projectId: string;
      storageBucket?: string;
      messagingSenderId?: string;
      appId?: string;
    };
    firestore: {
      enablePersistence: boolean;
      /**
       * Specifies custom configurations for your Cloud Firestore instance.
       * You must set these before invoking any other methods.
       */
      settings: FirestoreSettings;
      /**
       * Settings that can be passed to Firestore.enablePersistence() to configure
       * Firestore persistence.
       */
      persistenceSettings: PersistenceSettings;
    };
    /**
     * @deprecated use storage.bucket
     */
    storageBucket: string | null;
    /**
     * @deprecated use functions.region
     */
    region: string | null;
    /**
     * @deprecated use functions.origin
     */
    origin: string | null;
    /**
     * @deprecated use messaging.origin
     */
    vapid: string | null;
    storage: {
      bucket?: string,
      maxUploadRetryTime?: number,
      maxOperationRetryTime?: number,
    },
    analytics?: {
      enabled?: boolean;
    },
    messaging: {
      vapid: string | null;
    },
    functions: {
      region: string | null;
      origin: string | null;
    },
    emulator: {
      firestore?: [ string, number ],
      functions?: [ string, number ],
      auth?: [ string, number ],
    },
    appCheck: {
      isTokenAutoRefreshEnabled?: boolean;
      /**
       * reCaptcha key
       */
      siteKey?: string;
    };
    auth: {
      tenantId?: string;
      languageCode?: string;
      useDeviceLanguage?: boolean;
      persistence?: boolean;
      settings?: AuthSettings;
      google: boolean;
      facebook: boolean;
      twitter: boolean;
      github: boolean;
    };
  };
}
