import { NgModule } from '@angular/core';
import { FormControlsComponent } from './form-controls.component';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { CommonModule } from '@angular/common';
import { RxapFormsModule } from '@rxap/forms';
import { RouterModule } from '@angular/router';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';


@NgModule({
  declarations: [ FormControlsComponent ],
  imports:      [
    MatProgressSpinnerModule,
    FlexLayoutModule,
    MatButtonModule,
    CommonModule,
    RxapFormsModule,
    MatSnackBarModule,
  ],
  exports:      [ FormControlsComponent ]
})
export class FormControlsComponentModule {}
