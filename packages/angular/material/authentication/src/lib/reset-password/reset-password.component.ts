
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
import { Showcase } from '@ng-prism/core';

@Showcase({
  title: 'Reset Password',
  category: 'Authentication',
  description: 'Form to set a new password after a password reset request.',
  status: 'stable',
  variants: [
    { name: 'Default' },
  ],
})
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
    imports: [
    ReactiveFormsModule,
    FormDirective,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormControlMarkDirtyDirective,
    FormSubmitFailedDirective,
    FormSubmittingDirective,
    MatProgressBarModule,
    MatSnackBarModule,
    ControlErrorDirective
]
})
export class ResetPasswordComponent {
}
