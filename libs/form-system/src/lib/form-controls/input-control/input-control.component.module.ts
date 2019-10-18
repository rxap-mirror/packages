import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatInputModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';
import { InputControlComponent } from './input-control.component';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [ InputControlComponent],
  imports: [
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    FlexLayoutModule
  ],
  exports: [ InputControlComponent],
  entryComponents: [ InputControlComponent],
})
export class InputControlComponentModule { }
