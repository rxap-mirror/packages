import {
  Resolve,
  Router
} from '@angular/router';
import {
  Inject,
  Injectable
} from '@angular/core';
import { OAuthService } from './o-auth.service';
import { RXAP_O_AUTH_REDIRECT_LOGIN } from './tokens';

@Injectable({ providedIn: 'root' })
export class ProfileResolve<T = Record<string, any>> implements Resolve<T> {

  constructor(
    @Inject(OAuthService)
    private readonly oAuthService: OAuthService,
    @Inject(Router)
    private readonly router: Router,
    @Inject(RXAP_O_AUTH_REDIRECT_LOGIN)
    private readonly redirectLogin: string[]
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
