import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import {
  Injectable,
  Inject,
  isDevMode
} from '@angular/core';
import { OAuthService } from './o-auth.service';

@Injectable({ providedIn: 'root' })
export class OAuthRedirectGuard implements CanActivate, CanActivateChild {

  constructor(
    @Inject(OAuthService)
    private readonly oAuthService: OAuthService
  ) {
  }

  public async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {

    const isAuthenticated = await this.oAuthService.isAuthenticated();

    console.log(`isAuthenticated: ${isAuthenticated}`);

    if (isAuthenticated) {
      return true;
    }

    this.oAuthService.signInWithRedirect(state.url);

    return false;

  }

  public canActivateChild(childRoute: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    return this.canActivate(childRoute, state);
  }

}
