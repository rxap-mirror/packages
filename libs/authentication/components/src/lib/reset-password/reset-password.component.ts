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
  ]
})
export class ResetPasswordComponent {}
