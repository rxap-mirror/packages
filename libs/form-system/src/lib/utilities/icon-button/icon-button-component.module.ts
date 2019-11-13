import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconButtonComponent } from './icon-button.component';
import {
  MatButtonModule,
  MatIconModule
} from '@angular/material';
import { IconComponentModule } from '../icon/icon.component.module';


@NgModule({
  declarations: [ IconButtonComponent ],
  exports:      [ IconButtonComponent ],
  imports:      [
    CommonModule,
    MatButtonModule,
    IconComponentModule,
    MatIconModule
  ]
})
export class RxapIconButtonComponentModule {}
