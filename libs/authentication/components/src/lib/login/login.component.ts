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
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToggleSubject } from '@rxap/utilities/rxjs';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  FormSubmittingDirective,
  FormSubmitFailedDirective,
  FormControlMarkDirtyDirective,
  FormControlErrorDirective,
  FormDirective
} from '@rxap/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import {
  NgIf,
  AsyncPipe
} from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout/flex';
import { ReactiveFormsModule } from '@angular/forms';

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
  ],
  standalone:      true,
  imports:         [
    ReactiveFormsModule,
    FormDirective,
    FlexModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    FormControlErrorDirective,
    NgIf,
    MatButtonModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FormControlMarkDirtyDirective,
    FormSubmitFailedDirective,
    FormSubmittingDirective,
    MatProgressBarModule,
    AsyncPipe
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
