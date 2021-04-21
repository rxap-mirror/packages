import {
  OAuthService,
  OAuthMethodResponse,
  OAuthMethod,
  GetOAuthProfileMethod,
  PROFILE_AUTH_ENDPOINT,
  OAUTH_AUTH_ENDPOINT,
  OAUTH_SECRET,
  OAUTH_SSO_URL
} from '@rxap/oauth';
import {
  Injectable,
  Inject,
  Optional
} from '@angular/core';

@Injectable({ providedIn: 'root' })
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
    @Optional()
    @Inject(PROFILE_AUTH_ENDPOINT)
      profileEndpoint: string | null = null,
    @Optional()
    @Inject(OAUTH_AUTH_ENDPOINT)
      authEndpoint: string | null    = null,
    @Optional()
    @Inject(OAUTH_SECRET)
      secret: string | null          = null,
    @Optional()
    @Inject(OAUTH_SSO_URL)
      ssoUrl: string
  ) {
    super(oAuthMethod, getOAuthProfileMethod, profileEndpoint, authEndpoint, secret, ssoUrl);
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

}
