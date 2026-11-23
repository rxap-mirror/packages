import { Provider } from '@angular/core';
import {
  BehaviorSubject,
  ReplaySubject,
} from 'rxjs';
import {
  AuthenticationEvent,
  AuthenticationEventType,
  RxapAuthenticationService,
} from '../src/lib/authentication.service';

/**
 * Providers of the ng-prism styleguide host for the showcases of this library.
 * The styleguide has no authentication backend. The authentication service is replaced with a static one
 * whose authentication state is never resolved: the login page stays in the loading state and the sign out
 * directive can be clicked without any side effect.
 */
const events$ = new ReplaySubject<AuthenticationEvent>();
const isAuthenticated$ = new BehaviorSubject<boolean | null>(null);

export const PRISM_PROVIDERS: Provider[] = [
  {
    provide: RxapAuthenticationService,
    useValue: {
      isAuthenticated$,
      events$,
      signOut: () => {
        events$.next({ type: AuthenticationEventType.OnLogout });
        return Promise.resolve();
      },
      isAuthenticated: () => Promise.resolve(false),
    },
  },
];
