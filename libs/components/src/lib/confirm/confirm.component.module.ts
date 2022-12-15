import { NgModule } from '@angular/core';
import { ConfirmComponent } from './confirm.component';
import { FlexModule } from '@angular/flex-layout';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmDirective } from './confirm.directive';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

@NgModule({
  declarations: [ ConfirmComponent, ConfirmDirective ],
  imports:      [
    FlexModule,
    MatButtonModule,
    MatIconModule,
    OverlayModule
  ],
  exports:      [ ConfirmComponent, ConfirmDirective ]
})
export class ConfirmComponentModule {}
