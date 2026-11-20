import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RxapAuthenticationService } from './authentication.service';
import { RXAP_AUTHENTICATION_DEACTIVATED } from './tokens';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationRoutingService {
  private readonly router = inject<Router>(Router);
  private readonly authenticationService = inject<RxapAuthenticationService>(RxapAuthenticationService);
  private readonly deactivated = inject(RXAP_AUTHENTICATION_DEACTIVATED, { optional: true }) ?? null;


  constructor() {
    const deactivated = this.deactivated;

    if (!deactivated) {
      console.log('Authentication is enabled');
      this.authenticationService.isAuthenticated$.pipe(
        tap(isAuthenticated => {
          if (isAuthenticated) {
            return this.router.navigate([ '/' ]);
          } else {
            return this.router.navigate([ '/', 'authentication', 'login' ]);
          }
        }),
      ).subscribe();
    }
  }

}
