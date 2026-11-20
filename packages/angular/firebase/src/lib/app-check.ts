import { Injectable, isDevMode, NgModule, NgZone, inject } from '@angular/core';
import { ConfigService } from '@rxap/config';
import {
  EMPTY,
  Observable,
} from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import {
  FIREBASE_APP_NAME,
  FIREBASE_OPTIONS,
  ɵfirebaseAppFactory,
} from '@angular/fire/compat';
import { FirebaseOptions } from 'firebase/app';
import {
  AppCheck,
  AppCheckTokenResult,
  getToken,
  onTokenChanged,
  setTokenAutoRefreshEnabled,
} from '@angular/fire/app-check';
import {
  APP_CHECK_ENABLED,
  APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED,
  APP_CHECK_SITE_KEY,
} from './tokens';

@Injectable()
export class AppCheckService {
  private readonly config = inject(ConfigService);
  private readonly enabled = inject(APP_CHECK_ENABLED, { optional: true });


  public readonly onTokenChanged$: Observable<AppCheckTokenResult> = EMPTY;
  private readonly _appCheck: AppCheck | null = null;

  constructor() {
    const options = inject<FirebaseOptions>(FIREBASE_OPTIONS);
    const nameOrConfig = inject(FIREBASE_APP_NAME, { optional: true });
    const zone = inject<NgZone>(NgZone);
    const siteKey = inject(APP_CHECK_SITE_KEY, { optional: true });
    const isTokenAutoRefreshEnabled = inject(APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED, { optional: true });

    if (this.enabled) {
      if (siteKey) {
        const app: any = ɵfirebaseAppFactory(options, zone, nameOrConfig);
        const appCheck = this._appCheck = app.appCheck();
        appCheck.activate(
          siteKey,
          isTokenAutoRefreshEnabled ?? undefined,
        );
        this.onTokenChanged$ = (new Observable<AppCheckTokenResult>(subscriber => {
          onTokenChanged(
            appCheck,
            tokenResult => subscriber.next(tokenResult),
            error => subscriber.error(error),
            () => subscriber.complete(),
          );
        })).pipe(
          shareReplay(1),
        );
      } else {
        if (isDevMode()) {
          console.error('The app check site key is not provided');
        }
      }
    } else {
      if (isDevMode()) {
        console.warn('App check is disabled');
      }
    }
  }

  public getToken(forceRefresh?: boolean): Promise<string> {
    if (this._appCheck) {
      return getToken(this._appCheck, forceRefresh).then(result => result.token) ??
        Promise.reject(new Error('firebase app check is not initialized'));
    }
    return Promise.reject(new Error('firebase app check is not initialized'));
  }

  public setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled: boolean): void {
    if (this._appCheck) {
      setTokenAutoRefreshEnabled(this._appCheck, isTokenAutoRefreshEnabled);
    }
  }

}

@NgModule({
  providers: [ AppCheckService ],
})
export class RxapAngularFireAppCheckModule {
  readonly appCheck = inject<AppCheckService>(AppCheckService);

}
