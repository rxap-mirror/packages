import { NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher,
} from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import {
  FormControlMarkDirtyDirective,
  FormDirective,
  FormSubmitFailedDirective,
  FormSubmittingDirective,
} from '@rxap/forms';
import { ControlErrorDirective } from '@rxap/material-form-system';
import { fadeAnimation } from '../fade-animation';
import { ResetPasswordFormProviders } from './reset-password.form';

@Component({
  selector: 'rxap-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: [ './reset-password.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    ResetPasswordFormProviders,
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
    FormControlMarkDirtyDirective,
    FormSubmitFailedDirective,
    FormSubmittingDirective,
    MatProgressBarModule,
    MatSnackBarModule,
    ControlErrorDirective,
  ],
})
export class ResetPasswordComponent {
}
