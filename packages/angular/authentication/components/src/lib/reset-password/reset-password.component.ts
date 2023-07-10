import {
  Component,
  ChangeDetectionStrategy,
} from '@angular/core';
import {ResetPasswordFormProviders} from './reset-password.form';
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher,
} from '@angular/material/core';
import {fadeAnimation} from '../fade-animation';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {
  FormSubmittingDirective,
  FormSubmitFailedDirective,
  FormControlMarkDirtyDirective,
  FormControlErrorDirective,
  FormDirective,
} from '@rxap/forms';
import {MatButtonModule} from '@angular/material/button';
import {NgIf} from '@angular/common';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {FlexModule} from '@angular/flex-layout/flex';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'rxap-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
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
    FlexModule, MatIconModule, MatFormFieldModule, MatInputModule, FormControlErrorDirective, NgIf, MatButtonModule,
    FormControlMarkDirtyDirective, FormSubmitFailedDirective, FormSubmittingDirective, MatProgressBarModule,
    MatSnackBarModule,
  ],
})
export class ResetPasswordComponent {
}
