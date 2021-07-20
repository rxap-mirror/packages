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

export const APP_CHECK_DISABLED = new InjectionToken('rxap/firebase/app-check-disabled');

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
    @Inject(APP_CHECK_DISABLED)
    private readonly disabled: boolean | null
  ) {
    if (!this.disabled) {
      const appCheckConfig = this.config.get('firebase.appCheck');
      if (appCheckConfig && appCheckConfig.siteKey) {
        const app: any = ɵfirebaseAppFactory(options, zone, nameOrConfig);
        const appCheck = app.appCheck();
        appCheck.activate(
          appCheckConfig.siteKey,
          appCheckConfig.isTokenAutoRefreshEnabled
        );
      } else {
        if (isDevMode()) {
          console.warn('The app check is not loaded');
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
