import {
  Inject,
  Injectable,
  InjectionToken,
  Optional
} from '@angular/core';
import {
  GetOAuthProfileMethod,
  PROFILE_AUTH_ENDPOINT
} from './get-o-auth-profile.method';
import {
  OAuthMethod,
  OAuthMethodResponse
} from './o-auth.method';
import {
  RXAP_O_AUTH_REDIRECT_SIGN_OUT,
  RXAP_O_AUTH_REDIRECT_URL
} from './tokens';
import { Router } from '@angular/router';
import { ReplaySubject, Subject } from 'rxjs';
import { AuthenticationEvent, AuthenticationEventType } from '@rxap/authentication';

export const OAUTH_SECRET = new InjectionToken('OAUTH_SECRET');
export const OAUTH_AUTH_ENDPOINT = new InjectionToken('OAUTH_AUTH_ENDPOINT');
export const OAUTH_SSO_URL = new InjectionToken('OAUTH_SSO_URL');
export const OAUTH_CLIENT_ID = new InjectionToken('OAUTH_CLIENT_ID');

export const ACCESS_TOKEN_LOCAL_STORAGE_KEY = 'access_token';
export const REFRESH_TOKEN_LOCAL_STORAGE_KEY = 'refresh_token';
export const EXPIRES_AT_LOCAL_STORAGE_KEY = 'expires_at';
export const REMEMBER_LOCAL_STORAGE_KEY = 'remember';

export interface OAuthStatus {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn: number;
  expiresAt: Date;
}

@Injectable({ providedIn: 'root' })
export class OAuthService<Profile = any> {

  public readonly events$ = new ReplaySubject<AuthenticationEvent>();

  get expiresAt(): Date | null {
    const expiresAt = this.getItem(EXPIRES_AT_LOCAL_STORAGE_KEY);
    if (expiresAt) {
      return new Date(
        parseInt(this.getItem(EXPIRES_AT_LOCAL_STORAGE_KEY)!, 10)
      );
    }
    return null;
  }

  set expiresAt(value: Date | null) {
    if (value) {
      this.setItem(EXPIRES_AT_LOCAL_STORAGE_KEY, value.getTime().toFixed(0));
    } else {
      this.removeItem(EXPIRES_AT_LOCAL_STORAGE_KEY);
    }
  }

  get refreshToken(): string | null {
    return this.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
  }

  set refreshToken(value: string | null) {
    if (value) {
      this.setItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY, value);
    } else {
      this.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
    }
  }

  get accessToken(): string | null {
    return this.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
  }

  set accessToken(value: string | null) {
    if (value) {
      this.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, value);
    } else {
      this.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
    }
  }

  /**
   * The time until the access token expires in seconds
   */
  public get expiresIn(): number | null {
    const expiresAt = this.expiresAt;
    if (expiresAt) {
      return Math.round(
        (expiresAt.getTime() - Date.now()) / 1000
      );
    }
    return null;
  }

  public get remember(): boolean {
    return !!this.getItem(REMEMBER_LOCAL_STORAGE_KEY);
  }

  public set remember(value: boolean) {
    if (value) {
      this.setItem(REMEMBER_LOCAL_STORAGE_KEY, 'true');
    } else {
      this.removeItem(REMEMBER_LOCAL_STORAGE_KEY);
    }
  }

  private _profile?: Profile | null;

  protected _isAuthenticated: boolean | null = null;

  public get profile(): Profile | null | undefined {
    return this._profile;
  }

  constructor(
    @Inject(OAuthMethod)
    public readonly oAuthMethod: OAuthMethod,
    @Inject(GetOAuthProfileMethod)
    public readonly getOAuthProfileMethod: GetOAuthProfileMethod,
    @Inject(Router)
    private readonly router: Router,
    @Optional()
    @Inject(PROFILE_AUTH_ENDPOINT)
    public profileEndpoint: string | null = null,
    @Optional()
    @Inject(OAUTH_AUTH_ENDPOINT)
    public authEndpoint: string | null = null,
    @Optional()
    @Inject(OAUTH_SECRET)
    public secret: string | null = null,
    @Optional()
    @Inject(OAUTH_SSO_URL)
    private readonly ssoUrl: string | null = null,
    @Optional()
    @Inject(RXAP_O_AUTH_REDIRECT_SIGN_OUT)
    private readonly redirectSignOut: string[] | null = null,
    @Optional()
    @Inject(RXAP_O_AUTH_REDIRECT_URL)
    private readonly redirectUrl: string | null = null,
    @Optional()
    @Inject(OAUTH_CLIENT_ID)
    public clientId: string | null = null,
  ) {}

  public signInWithRedirect(lastUrl?: string): void {
    if (!this.redirectUrl) {
      throw new Error('Redirect url is not defined');
    }
    location.replace(
      `${this.ssoUrl}?redirect=${btoa(this.redirectUrl)}&secret=${
        this.secret
      }&payload=${btoa(JSON.stringify({ lastUrl }))}`
    );
  }

  public async isAuthenticated(): Promise<boolean> {
    if (!this.secret) {
      throw new Error('The oauth secret is not defined');
    }

    if (!this.authEndpoint) {
      throw new Error('The oauth auth endpoint is not defined');
    }

    if (this._isAuthenticated !== null) {
      return this._isAuthenticated;
    }

    if (this.accessToken) {
      console.debug('Access token is defined: ' + this.accessToken);
      if (this.expiresIn && this.expiresIn > 60) {
        const profile = await this.getProfile();

        if (!profile) {
          console.log('profile is not defined');
          return (this._isAuthenticated = false);
        }

        this.authenticated(
          {
            refreshToken: this.refreshToken,
            accessToken: this.accessToken,
            expiresAt: this.expiresAt ?? new Date(Date.now() + 60 * 1000),
            expiresIn: this.expiresIn,
          },
          this.remember
        );

        return (this._isAuthenticated = true);
      } else {
        this.accessToken = null;
        this.expiresAt   = null;
        console.warn(
          'The access token expires soon. Use refresh token instead.'
        );
      }
    }
    if (this.refreshToken) {
      console.debug('Refresh token is defined: ' + this.refreshToken);
      try {
        await this.signInWithRefreshToken(this.refreshToken);
        return (this._isAuthenticated = true);
      } catch (e) {
        if (![401, 403, 400].includes(e.status)) {
          console.error('Could not sign in with refresh token', e.message);
          throw e;
        }
        console.warn('Refresh token is expired');
      }
    }

    console.warn('Unauthenticated');

    return (this._isAuthenticated = false);
  }

  public async signInWithEmailAndPassword(
    email: string,
    password: string,
    remember: boolean
  ): Promise<OAuthMethodResponse> {
    if (!this.secret) {
      throw new Error('The oauth secret is not defined');
    }

    if (!this.authEndpoint) {
      throw new Error('The oauth auth endpoint is not defined');
    }

    const response = await this.oAuthMethod.call({
      username: email,
      password: password,
      authEndpoint: this.authEndpoint,
      secret: this.secret,
      clientId: this.clientId ?? undefined
    }).catch(e => {
      this.events$.next({ type: AuthenticationEventType.OnAuthError });
      throw e;
    });

    this.authenticated(response, remember);

    return response;
  }

  public async getProfile<T extends Profile = Profile>(): Promise<T | null> {
    let profile: T | null = null;

    if (!this.accessToken) {
      throw new Error('The access token is not defined');
    }

    if (this.profileEndpoint) {
      try {
        profile = await this.getOAuthProfileMethod.call({
          accessToken: this.accessToken,
          profileEndpoint: this.profileEndpoint,
        });
      } catch (e) {
        console.error('Could not request the user profile', e.message);
      }
    } else {
      console.warn('The profile endpoint is not defined!');
    }

    return (this._profile = profile);
  }

  public async signOut() {
    this.clearStorage();
    this.accessToken      = null;
    this.refreshToken     = null;
    this.expiresAt        = null;
    this._isAuthenticated = false;
    if (this.redirectSignOut) {
      await this.router.navigate(this.redirectSignOut);
    } else {
      if (!this.redirectUrl) {
        throw new Error('Redirect url is not defined');
      }
      location.replace(
        `${this.ssoUrl}?redirect=${btoa(this.redirectUrl)}&secret=${this.secret}&action=signOut`
      );
    }
    this.events$.next({ type: AuthenticationEventType.OnLogout });
  }

  public authenticated(
    response: OAuthStatus,
    remember: boolean = this.remember ?? false
  ): void {
    this.accessToken  = response.accessToken;
    this.refreshToken = response.refreshToken ?? null;
    this.expiresAt    = response.expiresAt;

    console.log(`Authenticated until ${this.expiresAt.toISOString()}`);

    this.remember = remember;

    if (remember) {
      this.setItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY, response.accessToken);
      if (response.refreshToken) {
        this.setItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY, response.refreshToken);
      }
      this.setItem(REMEMBER_LOCAL_STORAGE_KEY, 'true');
      if (response.expiresAt) {
        console.log(`Authenticated until ${response.expiresAt.toISOString()}`);
        this.setItem(
          EXPIRES_AT_LOCAL_STORAGE_KEY,
          response.expiresAt.getTime().toFixed(0)
        );
      }
    } else {
      this.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
      this.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
      this.removeItem(REMEMBER_LOCAL_STORAGE_KEY);
      this.removeItem(EXPIRES_AT_LOCAL_STORAGE_KEY);
    }

    this._isAuthenticated = true;
    this.events$.next({ type: AuthenticationEventType.OnAuthSuccess });
  }

  private getKey(key: string): string {
    return [this.secret, key].join('__');
  }

  private getItem(key: string): string | null {
    return localStorage.getItem(this.getKey(key));
  }

  private setItem(key: string, value: string): void {
    localStorage.setItem(this.getKey(key), value);
  }

  private removeItem(key: string): void {
    localStorage.removeItem(this.getKey(key));
  }

  protected clearStorage() {
    this.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
    this.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
    this.removeItem(REMEMBER_LOCAL_STORAGE_KEY);
    this.removeItem(EXPIRES_AT_LOCAL_STORAGE_KEY);
  }

  private async signInWithRefreshToken(
    refreshToken: string
  ): Promise<OAuthMethodResponse> {
    if (!this.secret) {
      throw new Error('The oauth secret is not defined');
    }

    if (!this.authEndpoint) {
      throw new Error('The oauth auth endpoint is not defined');
    }

    const response = await this.oAuthMethod.call({
      refreshToken,
      authEndpoint: this.authEndpoint,
      secret: this.secret,
      clientId: this.clientId ?? undefined,
    });

    this.authenticated(response);

    return response;
  }
}
