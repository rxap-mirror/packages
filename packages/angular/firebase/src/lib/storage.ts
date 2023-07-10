import {
  Inject,
  InjectionToken,
  NgModule,
  Optional,
} from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

export const USE_STORAGE_EMULATOR = new InjectionToken<[ string, number ]>('rxap/firebase/use-storage-emulator');

@NgModule({})
export class RxapAngularFireStorageModule {

  constructor(
    private readonly storage: AngularFireStorage,
    @Optional()
    @Inject(USE_STORAGE_EMULATOR)
      useEmulator: [ string, number ] | null,
  ) {
    if (useEmulator) {
      this.storage.storage.useEmulator(...useEmulator);
    }
  }

}
