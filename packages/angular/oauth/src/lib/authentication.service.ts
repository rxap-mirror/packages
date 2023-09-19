import {
  Inject,
  Injectable,
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
import { OAuthService } from 'angular-oauth2-oidc';
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
    @Inject(RXAP_AUTHENTICATION_ACCESS_TOKEN)
    private readonly authenticationAccessToken: BehaviorSubject<AuthenticationAccessToken | null>,
  ) {
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
    // The SPA's id. Register SPA with this id at the auth-server
    this.oauthService.clientId = 'qXfsteM2BCmrBu42xG3SdmsANrX2FTZbSJIor5JA';

    // set the scope for the permissions the client should request
    // The auth-server used here only returns a refresh token (see below), when the scope offline_access is requested
    this.oauthService.scope = 'openid profile email';

    // Use setStorage to use sessionStorage or another implementation of the TS-type Storage
    // instead of localStorage
    this.oauthService.setStorage(sessionStorage);

    this.oauthService.issuer = 'https://auth.127-0-0-1.nip.io:8443/application/o/angular/';
    this.oauthService.skipIssuerCheck = true;
    this.oauthService.strictDiscoveryDocumentValidation = false;

    // Set a dummy secret
    // Please note that the auth-server used here demand the client to transmit a client secret, although
    // the standard explicitly cites that the password flow can also be used without it. Using a client secret
    // does not make sense for a SPA that runs in the browser. That's why the property is called dummyClientSecret
    // Using such a dummy secret is as safe as using no secret.
    this.oauthService.dummyClientSecret = 'geheim';

    this.oauthService.redirectUri = window.location.origin + '/index.html';

    this.oauthService.silentRefreshRedirectUri = window.location.origin + '/silent-refresh.html';

    this.oauthService.setupAutomaticSilentRefresh();

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
