import {
  inject,
  Injectable,
  LOCALE_ID,
} from '@angular/core';
import {
  clone,
  deepMerge,
} from '@rxap/utilities';
import { BehaviorSubject } from 'rxjs';
import { UserSettings } from './user-settings';

@Injectable({ providedIn: 'root' })
export class UserSettingsOfflineService<T = unknown> {

  protected userSettings$ = new BehaviorSubject<UserSettings<T>>({
    darkMode: false,
    language: inject(LOCALE_ID),
    theme: {
      preset: 'default',
    },
  } as any);

  get() {
    return clone(this.userSettings$.value);
  }

  set(settings: UserSettings<T>) {
    this.userSettings$.next(settings);
  }

  update(settings: Partial<UserSettings<T>>) {
    this.userSettings$.next(deepMerge(this.userSettings$.value, settings));
  }

}
