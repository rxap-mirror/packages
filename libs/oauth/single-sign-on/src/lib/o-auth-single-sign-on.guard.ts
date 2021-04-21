import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import {
  Inject,
  Injectable
} from '@angular/core';
import { OAuthSingleSignOnService } from './o-auth-single-sign-on.service';
import {
  OAuthService,
  RXAP_O_AUTH_REDIRECT_LOGIN
} from '@rxap/oauth';
import { RXAP_O_AUTH_SINGLE_SIGN_ON_REDIRECT_CONTINUE } from './tokens';

@Injectable({ providedIn: 'root' })
export class OAuthSingleSignOnGuard implements CanActivate {

  constructor(
    @Inject(OAuthService)
    private readonly authentication: OAuthSingleSignOnService,
    @Inject(Router)
    private readonly router: Router,
    @Inject(RXAP_O_AUTH_SINGLE_SIGN_ON_REDIRECT_CONTINUE)
    private readonly redirectContinue: string[],
    @Inject(RXAP_O_AUTH_REDIRECT_LOGIN)
    private readonly redirectLogin: string[]
  ) {
  }

  public async canActivate(route: ActivatedRouteSnapshot): Promise<boolean | UrlTree> {

    const redirect = route.queryParamMap.get('redirect');
    const secret   = route.queryParamMap.get('secret');
    const payload  = route.queryParamMap.get('payload');

    if (!redirect || !secret) {
      console.warn(`The query params 'redirect' or 'secret' is not defined!`);
      return true;
    }

    this.authentication.secret   = secret;
    this.authentication.redirect = atob(redirect);
    this.authentication.payload  = payload;

    const isAuthenticated = await this.authentication.isAuthenticated();

    console.log('isAuthenticated', isAuthenticated);

    if (isAuthenticated) {
      return this.router.createUrlTree(this.redirectContinue);
    }

    return this.router.createUrlTree(this.redirectLogin);
  }

}
