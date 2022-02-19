import {
  Inject,
  Injectable,
  InjectionToken,
  isDevMode,
  NgModule,
  NgZone,
  Optional
} from '@angular/core';
import { ConfigService } from '@rxap/config';
import {
  Observable,
  EMPTY
} from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import type {
  AppCheckTokenResult,
  AppCheck
} from '@firebase/app-check';
import {
  FIREBASE_OPTIONS,
  FIREBASE_APP_NAME,
  ɵfirebaseAppFactory
} from '@angular/fire/compat';
import { FirebaseOptions } from 'firebase/app';
import {
  onTokenChanged,
  setTokenAutoRefreshEnabled
} from '@angular/fire/app-check';
import { getToken } from '@angular/fire/app-check';

export const APP_CHECK_ENABLED                       = new InjectionToken('rxap/firebase/app-check-enabled');
export const APP_CHECK_SITE_KEY                      = new InjectionToken('rxap/firebase/app-check-site-key');
export const APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED = new InjectionToken('rxap/firebase/app-check-is-token-auto-refresh-enabled');

@Injectable()
export class AppCheckService {

  public readonly onTokenChanged$: Observable<AppCheckTokenResult> = EMPTY;
  private readonly _appCheck: AppCheck | null                      = null;

  constructor(
    @Inject(FIREBASE_OPTIONS)
      options: FirebaseOptions,
    @Optional()
    @Inject(FIREBASE_APP_NAME)
      nameOrConfig: string,
    @Inject(NgZone)
      zone: NgZone,
    private readonly config: ConfigService,
    @Optional()
    @Inject(APP_CHECK_ENABLED)
    private readonly enabled: boolean | null,
    @Optional()
    @Inject(APP_CHECK_SITE_KEY)
      siteKey: string | null,
    @Optional()
    @Inject(APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED)
      isTokenAutoRefreshEnabled: boolean | null
  ) {
    if (this.enabled) {
      if (siteKey) {
        const app: any = ɵfirebaseAppFactory(options, zone, nameOrConfig);
        const appCheck = this._appCheck = app.appCheck();
        appCheck.activate(
          siteKey,
          isTokenAutoRefreshEnabled ?? undefined
        );
        this.onTokenChanged$ = (new Observable<AppCheckTokenResult>(subscriber => {
          onTokenChanged(
            appCheck,
            tokenResult => subscriber.next(tokenResult),
            error => subscriber.error(error),
            () => subscriber.complete()
          );
        })).pipe(
          shareReplay(1)
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
      return getToken(this._appCheck, forceRefresh).then(result => result.token) ?? Promise.reject(new Error('firebase app check is not initialized'));
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
  providers: [ AppCheckService ]
})
export class RxapAngularFireAppCheckModule {

  constructor(
    @Inject(AppCheckService)
    public readonly appCheck: AppCheckService
  ) {}

}
