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
  RXAP_AUTHENTICATION_DEACTIVATED,
} from '@rxap/authentication';
import { isDefined } from '@rxap/rxjs';
import {
  AUTH_CONFIG,
  AuthConfig,
  OAuthService,
} from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc-jwks';
import {
  BehaviorSubject,
  distinctUntilChanged,
  EMPTY,
  firstValueFrom,
  Observable,
  startWith,
  Subject,
} from 'rxjs';
import { map } from 'rxjs/operators';

const JONE_DOE_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

@Injectable()
export class AuthenticationService implements IAuthenticationService {
  events$: Observable<AuthenticationEvent> = EMPTY;
  public readonly isAuthenticated$ = new BehaviorSubject<boolean | null>(null);

  /**
   * Is only used when authentication is disabled to emit the events
   * @private
   */
  private readonly _events$ = new Subject<AuthenticationEvent>();

  constructor(
    private readonly oauthService: OAuthService,
    @Optional()
    @Inject(AUTH_CONFIG)
    private readonly authConfig: AuthConfig,
    @Inject(RXAP_AUTHENTICATION_ACCESS_TOKEN)
    private readonly authenticationAccessToken: BehaviorSubject<AuthenticationAccessToken | null>,
    @Inject(RXAP_AUTHENTICATION_DEACTIVATED)
    private readonly isAuthDisabled: boolean,
  ) {
    if (this.isAuthDisabled) {
      this.events$ = this._events$.asObservable();
      this.linkEventsAndIsAuthenticated();
      this._events$.next({
        type: AuthenticationEventType.OnAuthSuccess,
        payload: null,
      });
      this.authenticationAccessToken.next({
        token: JONE_DOE_JWT,
        valid: true,
      });
    } else {
      this.init();
    }
  }

  init() {
    if (this.authConfig) {
      this.oauthService.configure(this.authConfig);
    }
    this.events$ = this.oauthService.events.pipe(
      map(event => {
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
    this.linkEventsAndIsAuthenticated();

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
    if (this.isAuthDisabled) {
      this._events$.next({
        type: AuthenticationEventType.OnLogout,
        payload: null,
      });
    } else {
      this.oauthService.logOut();
    }
  }

  signIn() {
    if (this.isAuthDisabled) {
      this._events$.next({
        type: AuthenticationEventType.OnAuthSuccess,
        payload: null,
      });
    } else {
      this.oauthService.initLoginFlow();
    }
  }

  private linkEventsAndIsAuthenticated() {
    this.events$.pipe(
      map(event => event ? event.type === AuthenticationEventType.OnAuthSuccess : null),
      distinctUntilChanged(),
      startWith(null),
    ).subscribe(this.isAuthenticated$);
  }

  isAuthenticated(): Promise<boolean> {
    return firstValueFrom(this.isAuthenticated$.pipe(isDefined()));
  }

}
