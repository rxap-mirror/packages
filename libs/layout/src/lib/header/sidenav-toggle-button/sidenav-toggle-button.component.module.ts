import { NgModule } from '@angular/core';
import { SidenavToggleButtonComponent } from './sidenav-toggle-button.component';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';


@NgModule({
  declarations: [SidenavToggleButtonComponent],
  imports: [
    MatIconModule,
    CommonModule,
    MatButtonModule
  ],
  exports: [SidenavToggleButtonComponent]
})
export class SidenavToggleButtonComponentModule { }
