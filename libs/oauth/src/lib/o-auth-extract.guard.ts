import {
  ActivatedRouteSnapshot,
  CanActivate,
  UrlTree,
  Router
} from '@angular/router';
import { Injectable } from '@angular/core';
import { OAuthService } from './o-auth.service';

@Injectable({ providedIn: 'root' })
export class OAuthExtractGuard implements CanActivate {

  constructor(
    private readonly router: Router,
    private readonly oAuthService: OAuthService
  ) {}

  public canActivate(route: ActivatedRouteSnapshot): UrlTree {

    if (route.queryParamMap.has('accessToken') && route.queryParamMap.has('refreshToken') && route.queryParamMap.has('expiresIn')) {

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const accessToken   = route.queryParamMap.get('accessToken')!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const refreshToken  = route.queryParamMap.get('refreshToken')!;
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const expiresIn     = parseInt(route.queryParamMap.get('expiresIn')!, 10);
      const payloadBase64 = route.queryParamMap.get('payload');

      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      this.oAuthService.authenticated({
        accessToken,
        refreshToken,
        expiresIn,
        expiresAt
      }, true);

      let redirectUrl = '/';

      if (payloadBase64) {
        try {
          const payload = JSON.parse(atob(payloadBase64));
          console.debug('sso redirect payload', payload);
          if (payload.lastUrl) {
            redirectUrl = payload.lastUrl;
          }
        } catch (e) {
          console.error('Could not parse redirect payload', e.message);
        }
      }

      return this.router.createUrlTree([ redirectUrl ]);

    } else {
      console.warn('Not every query parameter is defined!');
    }

    return this.router.createUrlTree([ ...route.url.map(url => url.path), 'redirect' ]);
  }


}
