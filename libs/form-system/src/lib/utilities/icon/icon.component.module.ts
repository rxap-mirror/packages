import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from './icon.component';
import { MatIconModule } from '@angular/material';
import { IconDirective } from './icon.directive';

@NgModule({
  declarations: [ IconComponent, IconDirective ],
  imports:      [
    MatIconModule,
    CommonModule
  ],
  exports:      [ IconComponent, IconDirective ]
})
export class IconComponentModule {}
