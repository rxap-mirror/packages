import { NgModule } from '@angular/core';
import { ResetPasswordComponent } from './reset-password.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { RxapFormsModule } from '@rxap/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';


@NgModule({
  declarations: [
    ResetPasswordComponent
  ],
  imports:      [
    MatCardModule,
    FlexLayoutModule,
    MatButtonModule,
    CommonModule,
    MatProgressSpinnerModule,
    MatInputModule,
    RxapFormsModule,
    MatIconModule,
    ReactiveFormsModule,
    MatProgressBarModule,
    MatSnackBarModule,
  ],
  exports:      [
    ResetPasswordComponent
  ]
})
export class ResetPasswordComponentModule {}
