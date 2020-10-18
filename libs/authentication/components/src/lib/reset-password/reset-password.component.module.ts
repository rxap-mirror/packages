import { NgModule } from '@angular/core';
import { ResetPasswordComponent } from './reset-password.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { RxapFormsModule } from '@rxap/forms';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';


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
