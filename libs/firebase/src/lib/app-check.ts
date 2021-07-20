import {
  Inject,
  Injectable,
  InjectionToken,
  isDevMode,
  NgModule,
  NgZone,
  Optional
} from '@angular/core';
import {
  FIREBASE_APP_NAME,
  FIREBASE_OPTIONS,
  FirebaseAppConfig,
  FirebaseOptions,
  ɵfirebaseAppFactory
} from '@angular/fire';
import { ConfigService } from '@rxap/config';

export const APP_CHECK_ENABLED                       = new InjectionToken('rxap/firebase/app-check-enabled');
export const APP_CHECK_SITE_KEY                      = new InjectionToken('rxap/firebase/app-check-site-key');
export const APP_CHECK_IS_TOKEN_AUTO_REFRESH_ENABLED = new InjectionToken('rxap/firebase/app-check-is-token-auto-refresh-enabled');

@Injectable()
export class AppCheckService {

  constructor(
    @Inject(FIREBASE_OPTIONS)
      options: FirebaseOptions,
    @Optional()
    @Inject(FIREBASE_APP_NAME)
      nameOrConfig: string | FirebaseAppConfig | null | undefined,
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
        const appCheck = app.appCheck();
        appCheck.activate(
          siteKey,
          isTokenAutoRefreshEnabled ?? undefined
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
