import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { AuthorizationDevelopmentControlsComponent } from './authorization-development-controls.component';

@NgModule({
  declarations: [AuthorizationDevelopmentControlsComponent],
  exports: [
    AuthorizationDevelopmentControlsComponent,
  ],
  imports: [
    OverlayModule,
    MatButtonModule,
    FlexLayoutModule,
    MatListModule,
    MatSlideToggleModule,
    CommonModule,
  ],
})
export class AuthorizationDevelopmentControlsComponentModule {}
