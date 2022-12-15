import { NgModule } from '@angular/core';
import { AppsButtonComponent } from './apps-button.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { OverlayModule } from '@angular/cdk/overlay';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [ AppsButtonComponent ],
  imports:      [
    MatButtonModule,
    MatIconModule,
    MatGridListModule,
    OverlayModule,
    FlexLayoutModule,
    CommonModule,
    RouterModule
  ],
  exports:      [ AppsButtonComponent ]
})
export class AppsButtonComponentModule {}
