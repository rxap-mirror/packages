import { NgModule } from '@angular/core';
import { ToggleWindowSidenavButtonComponent } from './toggle-window-sidenav-button.component';
import { MatButtonModule } from '@angular/material/button';
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
