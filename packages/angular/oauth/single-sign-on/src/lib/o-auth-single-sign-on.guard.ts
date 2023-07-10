import {
  ActivatedRouteSnapshot,
  Router,
  UrlTree,
} from '@angular/router';
import {
  Inject,
  Injectable,
  Optional,
} from '@angular/core';
import { OAuthSingleSignOnService } from './o-auth-single-sign-on.service';
import {
  OAuthService,
  RXAP_O_AUTH_REDIRECT_SIGN_IN,
} from '@rxap/oauth';
import {
  RXAP_O_AUTH_SINGLE_SIGN_ON_REDIRECT_CONTINUE,
  RXAP_O_AUTH_SSO_REDIRECT_CONTINUE_DISABLED,
} from './tokens';

@Injectable()
export class OAuthSingleSignOnGuard {

  constructor(
    @Inject(OAuthService)
    private readonly authentication: OAuthSingleSignOnService,
    @Inject(Router)
    private readonly router: Router,
    @Inject(RXAP_O_AUTH_SINGLE_SIGN_ON_REDIRECT_CONTINUE)
    private readonly redirectContinue: string[],
    @Inject(RXAP_O_AUTH_REDIRECT_SIGN_IN)
    private readonly redirectLogin: string[],
    @Optional()
    @Inject(RXAP_O_AUTH_SSO_REDIRECT_CONTINUE_DISABLED)
    private readonly redirectContinueDisabled: boolean | null,
  ) {
  }

  public async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {

    const redirect = route.queryParamMap.get('redirect');
    const secret = route.queryParamMap.get('secret');
    const payload = route.queryParamMap.get('payload');
    const action = route.queryParamMap.get('action');

    if (!redirect || !secret) {
      console.warn(`The query params 'redirect' or 'secret' is not defined!`);
      return this.router.createUrlTree([ 'error' ]);
    }

    this.authentication.redirect = atob(redirect);
    this.authentication.payload = payload;
    this.authentication.secret = secret;

    if (action) {
      if (action === 'signOut') {
        await this.authentication.signOut();
        return this.router.createUrlTree(this.redirectLogin);
      }
    }

    const isAuthenticated = await this.authentication.isAuthenticated();

    console.log('isAuthenticated', isAuthenticated);

    if (isAuthenticated) {
      if (this.redirectContinueDisabled) {
        this.authentication.redirectToClient();
        return true;
      }
      return this.router.createUrlTree(this.redirectContinue);
    }

    return this.router.createUrlTree(this.redirectLogin);
  }

}
