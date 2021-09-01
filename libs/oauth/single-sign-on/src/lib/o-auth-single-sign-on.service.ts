import {
  OAuthService,
  OAuthMethodResponse,
  OAuthMethod,
  GetOAuthProfileMethod,
  PROFILE_AUTH_ENDPOINT,
  OAUTH_AUTH_ENDPOINT,
  OAUTH_SECRET,
  OAUTH_SSO_URL,
  RXAP_O_AUTH_REDIRECT_SIGN_OUT,
  RXAP_O_AUTH_REDIRECT_URL
} from '@rxap/oauth';
import {
  Injectable,
  Inject,
  Optional
} from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class OAuthSingleSignOnService extends OAuthService {

  public payload: string | null  = null;
  public redirect: string | null = null;

  // It is required to define the constructor with the injection
  // definition. If not defined the constructor will be created by
  // typescript without an parameters, bc the payload and redirect
  // initialization is done in the constructor.
  constructor(
    @Inject(OAuthMethod)
      oAuthMethod: OAuthMethod,
    @Inject(GetOAuthProfileMethod)
      getOAuthProfileMethod: GetOAuthProfileMethod,
    @Inject(Router)
      router: Router,
    @Optional()
    @Inject(PROFILE_AUTH_ENDPOINT)
      profileEndpoint: string | null = null,
    @Optional()
    @Inject(OAUTH_AUTH_ENDPOINT)
      authEndpoint: string | null      = null,
    @Optional()
    @Inject(OAUTH_SECRET)
      secret: string | null            = null,
    @Optional()
    @Inject(OAUTH_SSO_URL)
      ssoUrl: string | null            = null,
    @Optional()
    @Inject(RXAP_O_AUTH_REDIRECT_SIGN_OUT)
      redirectSignOut: string[] | null = null,
    @Optional()
    @Inject(RXAP_O_AUTH_REDIRECT_URL)
      redirectUrl: string | null       = null
  ) {
    super(oAuthMethod, getOAuthProfileMethod, router, profileEndpoint, authEndpoint, secret, ssoUrl, redirectSignOut, redirectUrl);
  }

  public async signInWithEmailAndPassword(
    email: string,
    password: string,
    remember: boolean
  ): Promise<OAuthMethodResponse> {
    const response = await super.signInWithEmailAndPassword(email, password, remember);
    this.redirectToClient();
    return response;
  }

  public redirectToClient() {
    window.location.replace(`${this.redirect}?accessToken=${this.accessToken}&refreshToken=${this.refreshToken}&expiresIn=${this.expiresIn}&payload=${this.payload}`);
  }

  public async signOut() {
    this.clearStorage();
    this.accessToken      = null;
    this.refreshToken     = null;
    this.expiresAt        = null;
    this._isAuthenticated = false;
  }

}
