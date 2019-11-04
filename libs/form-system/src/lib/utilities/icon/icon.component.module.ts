import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';
import { MatIconModule } from '@angular/material';

@NgModule({
  declarations: [ IconComponent ],
  imports:      [
    MatIconModule,
    CommonModule
  ],
  exports:      [ IconComponent ]
})
export class IconComponentModule {}
