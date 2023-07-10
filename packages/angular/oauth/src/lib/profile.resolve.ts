import { Router } from '@angular/router';
import {
  Inject,
  Injectable,
} from '@angular/core';
import { OAuthService } from './o-auth.service';
import { RXAP_O_AUTH_REDIRECT_SIGN_IN } from './tokens';

@Injectable({ providedIn: 'root' })
export class ProfileResolve<T = Record<string, any>> {

  constructor(
    @Inject(OAuthService)
    private readonly oAuthService: OAuthService,
    @Inject(Router)
    private readonly router: Router,
    @Inject(RXAP_O_AUTH_REDIRECT_SIGN_IN)
    private readonly redirectLogin: string[],
  ) {
  }

  public async resolve(): Promise<T> {
    const profile = await this.oAuthService.getProfile();

    if (!profile) {
      await this.router.navigate(this.redirectLogin);
    }

    return profile;
  }

}
