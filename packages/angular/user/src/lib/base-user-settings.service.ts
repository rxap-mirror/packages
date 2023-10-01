import {
  inject,
  Injectable,
} from '@angular/core';
import { RxapAuthenticationService } from '@rxap/authentication';
import {
  filter,
  firstValueFrom,
  of,
  timeout,
} from 'rxjs';

@Injectable()
export abstract class BaseUserSettingsService {

  protected readonly auth = inject(RxapAuthenticationService);

  protected waitForAuthenticationTimeout = 10000;

  waitUntilAuthenticated(): Promise<boolean> {
    return firstValueFrom(this.auth.isAuthenticated$.pipe(
      filter((isAuthenticated): isAuthenticated is boolean => isAuthenticated === true),
      timeout({ each: this.waitForAuthenticationTimeout, with: () => of(false) }),
    ));
  }

}
