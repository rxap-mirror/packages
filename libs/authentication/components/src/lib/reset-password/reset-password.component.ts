import {
  Component,
  ChangeDetectionStrategy
} from '@angular/core';
import { ResetPasswordFormProviders } from './reset-password.form';
import {
  ErrorStateMatcher,
  ShowOnDirtyErrorStateMatcher
} from '@angular/material/core';
import { fadeAnimation } from '../fade-animation';
import { MatLegacyProgressBarModule } from '@angular/material/legacy-progress-bar';
import {
  FormSubmittingDirective,
  FormSubmitFailedDirective,
  FormControlMarkDirtyDirective,
  FormControlErrorDirective,
  FormDirective
} from '@rxap/forms';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { NgIf } from '@angular/common';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacyFormFieldModule } from '@angular/material/legacy-form-field';
import { MatIconModule } from '@angular/material/icon';
import { FlexModule } from '@angular/flex-layout/flex';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector:        'rxap-reset-password',
  templateUrl:     './reset-password.component.html',
  styleUrls:       [ './reset-password.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers:       [
    ResetPasswordFormProviders,
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
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    FormControlErrorDirective,
    NgIf,
    MatLegacyButtonModule,
    FormControlMarkDirtyDirective,
    FormSubmitFailedDirective,
    FormSubmittingDirective,
    MatLegacyProgressBarModule
  ]
})
export class ResetPasswordComponent {}
