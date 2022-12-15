import { NgModule } from '@angular/core';
import { ToggleWindowSidenavButtonComponent } from './toggle-window-sidenav-button.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [ ToggleWindowSidenavButtonComponent ],
  imports:      [
    MatButtonModule,
    MatIconModule,
    CommonModule,
  ],
  exports:      [ ToggleWindowSidenavButtonComponent ],
})
export class ToggleWindowSidenavButtonModule {}
