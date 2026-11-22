import {
  EnvironmentProviders,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

export const USE_STORAGE_EMULATOR = new InjectionToken<[ string, number ]>('rxap/firebase/use-storage-emulator');

/**
 * Connects the AngularFireStorage to the emulator if USE_STORAGE_EMULATOR is provided
 * (replaces the former RxapAngularFireStorageModule).
 */
export function provideAngularFireStorageEmulator(): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const storage = inject(AngularFireStorage);
      const useEmulator = inject(USE_STORAGE_EMULATOR, { optional: true });
      if (useEmulator) {
        storage.storage.useEmulator(...useEmulator);
      }
    }),
  ]);
}
