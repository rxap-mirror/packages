import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatInputModule,
  MatButtonModule,
  MatIconModule
} from '@angular/material';
import { RxapInputControlComponent } from './input-control.component';
import { FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RxapComponentSystemModule } from '@rxap/component-system';

@NgModule({
  declarations:    [ RxapInputControlComponent ],
  imports:         [
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    CommonModule,
    FormsModule,
    FlexLayoutModule,
    RxapComponentSystemModule.register([ RxapInputControlComponent ])
  ],
  exports:         [ RxapInputControlComponent ],
  entryComponents: [ RxapInputControlComponent ]
})
export class RxapInputControlComponentModule {}
