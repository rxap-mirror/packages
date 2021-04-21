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

export const OAUTH_SECRET        = new InjectionToken('OAUTH_SECRET');
export const OAUTH_AUTH_ENDPOINT = new InjectionToken('OAUTH_AUTH_ENDPOINT');
export const OAUTH_SSO_URL       = new InjectionToken('OAUTH_SSO_URL');

export const ACCESS_TOKEN_LOCAL_STORAGE_KEY  = 'access_token';
export const REFRESH_TOKEN_LOCAL_STORAGE_KEY = 'refresh_token';
export const EXPIRES_AT_LOCAL_STORAGE_KEY    = 'expires_at';
export const REMEMBER_LOCAL_STORAGE_KEY      = 'remember';

export interface OAuthStatus {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn: number;
  expiresAt: Date;
}

@Injectable({ providedIn: 'root' })
export class OAuthService {

  public accessToken?: string | null;
  public refreshToken?: string | null;
  /**
   * The time until the access token expires in seconds
   */
  public expiresIn?: number | null;
  public expiresAt?: Date | null;
  public remember?: boolean;

  constructor(
    @Inject(OAuthMethod)
    public readonly oAuthMethod: OAuthMethod,
    @Inject(GetOAuthProfileMethod)
    public readonly getOAuthProfileMethod: GetOAuthProfileMethod,
    @Optional()
    @Inject(PROFILE_AUTH_ENDPOINT)
    public profileEndpoint: string | null = null,
    @Optional()
    @Inject(OAUTH_AUTH_ENDPOINT)
    public authEndpoint: string | null    = null,
    @Optional()
    @Inject(OAUTH_SECRET)
    public secret: string | null          = null,
    @Optional()
    @Inject(OAUTH_SSO_URL)
    private readonly ssoUrl: string
  ) {}

  public signInWithRedirect(lastUrl?: string): void {
    location.replace(`${this.ssoUrl}?redirect=${btoa(location.origin + '/sso')}&secret=${this.secret}&payload=${btoa(JSON.stringify({ lastUrl }))}`);
  }

  public async isAuthenticated(): Promise<boolean> {

    if (!this.secret) {
      throw new Error('The oauth secret is not defined');
    }

    if (!this.authEndpoint) {
      throw new Error('The oauth auth endpoint is not defined');
    }

    this.accessToken  = this.getItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
    this.refreshToken = this.getItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
    if (this.getItem(REMEMBER_LOCAL_STORAGE_KEY)) {
      this.remember = true;
    }
    if (this.getItem(EXPIRES_AT_LOCAL_STORAGE_KEY)) {
      this.expiresAt = new Date(parseInt(this.getItem(EXPIRES_AT_LOCAL_STORAGE_KEY)!, 10));
      this.expiresIn = Math.round((this.expiresAt.getTime() - Date.now()) / 1000);
    }

    if (this.accessToken) {
      console.debug('Access token is defined: ' + this.accessToken);
      if (this.expiresIn && this.expiresIn > 60) {

        const profile = await this.getProfile();

        if (!profile) {
          console.log('profile is not defined');
          return false;
        }

        this.authenticated({
          refreshToken: this.refreshToken,
          accessToken:  this.accessToken,
          expiresAt:    this.expiresAt ?? new Date(Date.now() + 60 * 1000),
          expiresIn:    this.expiresIn
        }, this.remember);

        return true;
      } else {
        this.accessToken = undefined;
        this.expiresIn   = undefined;
        this.expiresAt   = undefined;
        this.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
        this.removeItem(EXPIRES_AT_LOCAL_STORAGE_KEY);
        console.warn('The access token expires soon. Use refresh token instead.');
      }
    }
    if (this.refreshToken) {
      console.debug('Refresh token is defined: ' + this.refreshToken);
      try {
        await this.signInWithRefreshToken(this.refreshToken);
        return true;
      } catch (e) {
        if (e.status !== 401 && e.status !== 400) {
          console.error('Could not sign in with refresh token', e.message);
          throw e;
        }
        console.warn('Refresh token is expired');
      }
    }

    console.warn('Unauthenticated', localStorage.length);

    return false;
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
      username:     email,
      password:     password,
      authEndpoint: this.authEndpoint,
      secret:       this.secret
    });

    this.authenticated(response, remember);

    return response;
  }

  public async getProfile<T = any>(): Promise<T | null> {
    let profile: T | null = null;

    if (!this.accessToken) {
      throw new Error('The access token is not defined');
    }

    if (this.profileEndpoint) {
      try {
        profile = await this.getOAuthProfileMethod.call({
          accessToken:     this.accessToken,
          profileEndpoint: this.profileEndpoint
        });
      } catch (e) {
        console.error('Could not request the user profile', e.message);
      }
    } else {
      console.warn('The profile endpoint is not defined!');
    }

    return profile;
  }

  public signOut() {
    this.clearStorage();
    this.accessToken  = undefined;
    this.refreshToken = undefined;
    this.expiresAt    = undefined;
    this.remember     = undefined;
    this.expiresIn    = undefined;
  }

  protected authenticated(response: OAuthStatus, remember: boolean = this.remember ?? false): void {
    this.accessToken  = response.accessToken;
    this.refreshToken = response.refreshToken;
    this.expiresAt    = response.expiresAt;
    this.expiresIn    = response.expiresIn;

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
        this.setItem(EXPIRES_AT_LOCAL_STORAGE_KEY, response.expiresAt.getTime().toFixed(0));
      }
    } else {
      this.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
      this.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
      this.removeItem(REMEMBER_LOCAL_STORAGE_KEY);
      this.removeItem(EXPIRES_AT_LOCAL_STORAGE_KEY);
    }

  }

  private getKey(key: string): string {
    return [ this.secret, key ].join('__');
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

  private clearStorage() {
    localStorage.removeItem(ACCESS_TOKEN_LOCAL_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_LOCAL_STORAGE_KEY);
    localStorage.removeItem(REMEMBER_LOCAL_STORAGE_KEY);
    localStorage.removeItem(EXPIRES_AT_LOCAL_STORAGE_KEY);
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
      secret:       this.secret
    });

    this.authenticated(response);

    return response;
  }

}
