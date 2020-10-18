import { NgModule } from '@angular/core';
import { ButtonComponent } from './button.component';
import { MatRippleModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmComponentModule } from '../confirm/confirm.component.module';
import { IconDirectiveModule } from '@rxap/directives/material/icon';


@NgModule({
  declarations: [ ButtonComponent ],
  imports:      [
    MatRippleModule,
    FlexLayoutModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    ConfirmComponentModule,
    IconDirectiveModule
  ],
  exports:      [ ButtonComponent ]
})
export class ButtonComponentModule {}
