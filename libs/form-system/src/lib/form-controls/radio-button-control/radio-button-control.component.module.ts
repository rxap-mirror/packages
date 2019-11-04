import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioButtonControlComponent } from './radio-button-control.component';
import {
  MatRadioModule,
  MatFormFieldModule
} from '@angular/material';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RxapComponentSystemModule } from '@rxap/component-system';


@NgModule({
  declarations:    [ RadioButtonControlComponent ],
  imports:         [
    CommonModule,
    MatRadioModule,
    FormsModule,
    MatFormFieldModule,
    FlexLayoutModule,
    RxapComponentSystemModule.register([ RadioButtonControlComponent ])
  ],
  exports:         [ RadioButtonControlComponent ],
  entryComponents: [ RadioButtonControlComponent ]
})
export class RxapRadioButtonControlModule {}
