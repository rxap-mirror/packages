import {
  EnvironmentProviders,
  inject,
  Injectable,
  makeEnvironmentProviders,
  provideAppInitializer,
} from '@angular/core';
import {
  AppCheckTokenResult,
  getToken,
  onTokenChanged,
  setTokenAutoRefreshEnabled,
} from 'firebase/app-check';
import {
  EMPTY,
  Observable,
} from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { FIREBASE_APP_CHECK } from './tokens';

@Injectable()
export class AppCheckService {
  private readonly appCheck = inject(FIREBASE_APP_CHECK, { optional: true }) ?? null;

  public readonly onTokenChanged$: Observable<AppCheckTokenResult> = this.appCheck ?
    new Observable<AppCheckTokenResult>(subscriber => onTokenChanged(
      this.appCheck!,
      tokenResult => subscriber.next(tokenResult),
      error => subscriber.error(error),
      () => subscriber.complete(),
    )).pipe(shareReplay({ bufferSize: 1, refCount: true })) :
    EMPTY;

  public getToken(forceRefresh?: boolean): Promise<string> {
    if (this.appCheck) {
      return getToken(this.appCheck, forceRefresh).then(result => result.token);
    }
    return Promise.reject(new Error('firebase app check is not initialized'));
  }

  public setTokenAutoRefreshEnabled(isTokenAutoRefreshEnabled: boolean): void {
    if (this.appCheck) {
      setTokenAutoRefreshEnabled(this.appCheck, isTokenAutoRefreshEnabled);
    }
  }

}

/**
 * Registers the AppCheckService and eagerly instantiates it on app initialization.
 */
export function provideFirebaseAppCheck(): EnvironmentProviders {
  return makeEnvironmentProviders([
    AppCheckService,
    provideAppInitializer(() => {
      inject(AppCheckService);
    }),
  ]);
}

/**
 * @deprecated use provideFirebaseAppCheck
 */
export const provideAngularFireAppCheck = provideFirebaseAppCheck;
