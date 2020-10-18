import { NgModule } from '@angular/core';
import { NavigateBackButtonComponent } from './navigate-back-button.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
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
