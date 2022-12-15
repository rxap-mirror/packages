import { NgModule } from '@angular/core';
import { NavigateBackButtonComponent } from './navigate-back-button.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [ NavigateBackButtonComponent ],
  imports:      [
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule
  ],
  exports:      [ NavigateBackButtonComponent ]
})
export class NavigateBackButtonComponentModule {}
