import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
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
