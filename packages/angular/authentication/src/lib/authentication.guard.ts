import {
  Inject,
  Injectable,
  Optional,
} from '@angular/core';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { RxapAuthenticationService } from './authentication.service';
import { RXAP_AUTHENTICATION_DEACTIVATED } from './tokens';

@Injectable({ providedIn: 'root' })
export class RxapAuthenticationGuard {

  public lastUrl: string | null = null;

  constructor(
    @Inject(RxapAuthenticationService)
    public authentication: RxapAuthenticationService,
    @Inject(Router)
    public router: Router,
    @Optional()
    @Inject(RXAP_AUTHENTICATION_DEACTIVATED)
    private readonly deactivated: boolean | null = null,
  ) {
  }

  public canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<UrlTree | boolean> {
    console.debug('[RxapAuthenticationGuard] can activate', state.url);
    return this.checkAuthStatus(route, state);
  }

  public canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<UrlTree | boolean> {
    console.debug('[RxapAuthenticationGuard] can activate child', state.url);
    return this.checkAuthStatus(childRoute, state);
  }

  private async checkAuthStatus(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Promise<UrlTree | boolean> {

    if (this.deactivated) {
      return true;
    }

    const authenticated = await this.authentication.isAuthenticated();

    if (authenticated === null) {
      if (!this.lastUrl || (state.url !== '/' && !state.url.match(/authentication\/login/))) {
        this.lastUrl = state.url;
      }
      return this.router.createUrlTree([ '/', 'authentication', 'loading' ]);
    }
    if (authenticated) {
      if (this.lastUrl && (state.url/*?*/ === '/' || state.url.match(/authentication\/login/))) {
        const lastUrl = this.lastUrl;
        this.lastUrl = null;
        return this.createUrlTreeToLastUrl(lastUrl);
      } else {
        if (state.url.match(/authentication/)) {
          if (state.url.match(/authentication\/reset-password/)) {
            return true;
          }
          return this.router.createUrlTree([ '/' ]);
        } else {
          this.lastUrl = null;
          return true;
        }
      }
    } else {
      if (!state.url.match(/^\/?authentication/)) {
        this.lastUrl = state.url;
      }
      if (state.url.match(/^\/?authentication/)) {
        if (this.lastUrl && this.lastUrl.match(/^\/?authentication/)) {
          const lastUrl = this.lastUrl;
          this.lastUrl = null;
          return this.createUrlTreeToLastUrl(lastUrl);
        }
        return true;
      } else {
        return this.router.createUrlTree([ '/', 'authentication', 'login' ]);
      }
    }

  }

  private createUrlTreeToLastUrl(lastUrl: string): UrlTree {

    const urlMatch = lastUrl.match(/^([^?#]+)(\?([^#]+))?(#(.+))?$/);

    if (urlMatch) {

      let queryParams: Record<string, string> = {};

      if (urlMatch[3]) {
        const queryParamsString = urlMatch[3];
        queryParams = queryParamsString.split('&').map(param => {
          const split = param.split('=');
          return { [split[0]]: split[1] };
        }).reduce((params, param) => ({ ...params, ...param }), {});
      }

      let fragment: string | undefined = undefined;

      if (urlMatch[5]) {
        fragment = urlMatch[5];
      }

      return this.router.createUrlTree([ urlMatch[1] ], {
        queryParams,
        fragment,
      });

    }

    return this.router.createUrlTree([ lastUrl ]);

  }

}
