import {
  EnvironmentProviders,
  inject,
  InjectionToken,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { connectStorageEmulator } from 'firebase/storage';
import { FIREBASE_STORAGE } from './tokens';

export const USE_STORAGE_EMULATOR = new InjectionToken<[ string, number ]>('rxap/firebase/use-storage-emulator');

/**
 * Connects the firebase storage to the emulator if USE_STORAGE_EMULATOR is provided.
 */
export function provideFirebaseStorageEmulator(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const storage = inject(FIREBASE_STORAGE);
      const useEmulator = inject(USE_STORAGE_EMULATOR, { optional: true });
      if (useEmulator) {
        connectStorageEmulator(storage, useEmulator[0], useEmulator[1]);
      }
    }),
  ]);
}

/**
 * @deprecated use provideFirebaseStorageEmulator
 */
export const provideAngularFireStorageEmulator = provideFirebaseStorageEmulator;
