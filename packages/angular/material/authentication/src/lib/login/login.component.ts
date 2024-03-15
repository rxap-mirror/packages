import {
  AsyncPipe,
  NgIf,
} from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Inject,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {
  MatSnackBar,
  MatSnackBarModule,
} from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RxapAuthenticationService } from '@rxap/authentication';
import {
  FormControlMarkDirtyDirective,
  FormDirective,
  FormSubmitFailedDirective,
  FormSubmittingDirective,
} from '@rxap/forms';
import { ControlErrorDirective } from '@rxap/material-form-system';
import { ToggleSubject } from '@rxap/rxjs';
import { fadeAnimation } from '../fade-animation';
import { LoginFormProviders } from './login.form';
import { RequestResetPasswordMethod } from './request-reset-password.method';

@Component({
  selector: 'rxap-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    LoginFormProviders,
    {
      provide: ErrorStateMatcher,
      useClass: ShowOnDirtyErrorStateMatcher,
    },
  ],
  animations: [
    fadeAnimation,
  ],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormDirective,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    NgIf,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FormControlMarkDirtyDirective,
    FormSubmitFailedDirective,
    FormSubmittingDirective,
    MatProgressBarModule,
    AsyncPipe,
    MatSnackBarModule,
    ControlErrorDirective,
  ],
})
export class LoginComponent {

  public readonly requestingPasswordReset$ = new ToggleSubject();

  private readonly requestPasswordResetMethod = inject(RequestResetPasswordMethod);

  constructor(
    @Inject(RxapAuthenticationService)
    private readonly authentication: RxapAuthenticationService,
    @Inject(MatSnackBar)
    private readonly snackBar: MatSnackBar,
  ) {
  }

  public async requestPasswordReset(email: string) {
    this.requestingPasswordReset$.enable();
    try {
      const result = await this.requestPasswordResetMethod.call({ email });

      if (!result) {
        this.snackBar.open(
          'The password reset request result is falsy',
          undefined,
          {
            duration: 5000,
            panelClass: 'error',
          },
        );
      } else {
        this.snackBar.open(
          'The password reset request was successful',
          undefined,
          {
            duration: 3000,
          },
        );
      }

    } catch (e: any) {
      this.snackBar.open(
        e.message,
        undefined,
        {
          duration: 3000,
          panelClass: 'error',
        },
      );
    } finally {
      this.requestingPasswordReset$.disable();
    }

  }
}
