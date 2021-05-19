import { NgModule } from '@angular/core';
import { FormControlsComponent } from './form-controls.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RxapFormsModule } from '@rxap/forms';
import { RouterModule } from '@angular/router';
import { MatSnackBarModule } from '@angular/material/snack-bar';


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
