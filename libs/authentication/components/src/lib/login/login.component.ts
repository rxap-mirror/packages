import {
  Component,
  ChangeDetectionStrategy,
  Inject
} from '@angular/core';
import { LoginFormProviders } from './login.form';
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher
} from '@angular/material/core';
import { fadeAnimation } from '../fade-animation';
import { RxapAuthenticationService } from '@rxap/authentication';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ToggleSubject } from '@rxap/utilities/rxjs';

@Component({
  selector:        'rxap-login',
  templateUrl:     './login.component.html',
  styleUrls:       [ './login.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    LoginFormProviders,
    {
      provide:  ErrorStateMatcher,
      useClass: ShowOnDirtyErrorStateMatcher
    }
  ],
  animations:      [
    fadeAnimation
  ]
})
export class LoginComponent {

  public readonly requestingPasswordReset$ = new ToggleSubject();

  constructor(
    @Inject(RxapAuthenticationService)
    private readonly authentication: RxapAuthenticationService,
    @Inject(MatSnackBar)
    private readonly snackBar: MatSnackBar
  ) {}

  public async requestPasswordReset(email: string) {
    this.requestingPasswordReset$.enable();
    try {
      const result = await this.authentication.requestPasswordReset(email);

      if (!result) {
        this.snackBar.open(
          'The password reset request result is falsy',
          undefined,
          {
            duration:   5000,
            panelClass: 'error'
          }
        );
      } else {
        this.snackBar.open(
          'The password reset request was successful',
          undefined,
          {
            duration: 3000
          }
        );
      }

    } catch (e: any) {
      this.snackBar.open(
        e.message,
        undefined,
        {
          duration:   3000,
          panelClass: 'error'
        }
      );
    } finally {
      this.requestingPasswordReset$.disable();
    }

  }
}
