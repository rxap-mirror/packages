import {
  Inject,
  Injectable,
  Optional,
} from '@angular/core';
import {
  AuthenticationAccessToken,
  AuthenticationEvent,
  AuthenticationEventType,
  IAuthenticationService,
  RXAP_AUTHENTICATION_ACCESS_TOKEN,
} from '@rxap/authentication';
import {
  isDefined,
  log,
} from '@rxap/rxjs';
import {
  AUTH_CONFIG,
  AuthConfig,
  OAuthService,
} from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import {
  BehaviorSubject,
  distinctUntilChanged,
  firstValueFrom,
  Observable,
  startWith,
} from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class AuthenticationService implements IAuthenticationService {
  events$: Observable<AuthenticationEvent>;
  isAuthenticated$ = new BehaviorSubject<boolean | null>(null);

  constructor(
    private readonly oauthService: OAuthService,
    @Optional()
    @Inject(AUTH_CONFIG)
      authConfig: AuthConfig,
    @Inject(RXAP_AUTHENTICATION_ACCESS_TOKEN)
    private readonly authenticationAccessToken: BehaviorSubject<AuthenticationAccessToken | null>,
  ) {
    if (authConfig) {
      this.oauthService.configure(authConfig);
    }
    this.events$ = this.oauthService.events.pipe(
      map(event => {
        console.log('event', event);
        switch (true) {
          case [ 'token_received', 'token_refreshed', 'silently_refreshed' ].includes(event.type):
            this.authenticationAccessToken.next({
              token: this.oauthService.getAccessToken(),
              valid: this.oauthService.hasValidAccessToken(),
            });
            return {
              type: AuthenticationEventType.OnAuthSuccess,
              payload: event,
            };
          case event.type.endsWith('_error') ||
          [ 'silent_refresh_timeout', 'invalid_nonce_in_state' ].includes(event.type):
            this.authenticationAccessToken.next(null);
            return {
              type: AuthenticationEventType.OnAuthError,
              payload: event,
            };
          case [ 'token_expires', 'logout', 'session_terminated' ].includes(event.type):
            this.authenticationAccessToken.next(null);
            return {
              type: AuthenticationEventType.OnLogout,
              payload: event,
            };
          default:
            console.warn('Unhandled event', event);
            return null;
        }
      }),
      isDefined(),
    );
    this.events$.pipe(
      log('event'),
      map(() => this.oauthService.hasValidAccessToken()),
      distinctUntilChanged(),
      startWith(null),
    ).subscribe(this.isAuthenticated$);

    // Use setStorage to use sessionStorage or another implementation of the TS-type Storage
    // instead of localStorage
    this.oauthService.setStorage(sessionStorage);

    if (this.oauthService.silentRefreshRedirectUri) {
      this.oauthService.setupAutomaticSilentRefresh();
    }

    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(status => {
      this.isAuthenticated$.next(status);
    });

  }

  async signOut(): Promise<void> {
    this.oauthService.logOut();
  }

  signIn() {
    this.oauthService.initLoginFlow();
  }

  isAuthenticated(): Promise<boolean> {
    return firstValueFrom(this.isAuthenticated$.pipe(isDefined()));
  }

}
