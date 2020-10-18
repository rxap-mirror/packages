import {
  Injectable,
  Inject,
  Optional
} from '@angular/core';
import { Router } from '@angular/router';
import { RxapAuthenticationService } from './authentication.service';
import { RXAP_AUTHENTICATION_DEACTIVATED } from './tokens';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationRoutingService {

  constructor(
    @Inject(Router)
    private readonly router: Router,
    @Inject(RxapAuthenticationService)
    private readonly authenticationService: RxapAuthenticationService,
    @Optional()
    @Inject(RXAP_AUTHENTICATION_DEACTIVATED)
    private readonly deactivated: boolean | null = null
  ) {
    if (!deactivated) {
      console.warn('Authentication is enabled');
      this.authenticationService.isAuthenticated$.pipe(
        tap(isAuthenticated => {
          if (isAuthenticated) {
            return this.router.navigate([ '/' ]);
          } else {
            return this.router.navigate([ '/', 'authentication', 'login' ]);
          }
        })
      ).subscribe();
    }
  }

}
