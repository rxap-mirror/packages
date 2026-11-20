import { InjectionToken, NgModule, inject } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

export const USE_STORAGE_EMULATOR = new InjectionToken<[ string, number ]>('rxap/firebase/use-storage-emulator');

@NgModule({})
export class RxapAngularFireStorageModule {
  private readonly storage = inject(AngularFireStorage);


  constructor() {
    const useEmulator = inject(USE_STORAGE_EMULATOR, { optional: true });

    if (useEmulator) {
      this.storage.storage.useEmulator(...useEmulator);
    }
  }

}
