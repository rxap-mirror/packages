import { NgModule } from '@angular/core';
import { DarkModeToggleButtonComponent } from './dark-mode-toggle-button.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { StopPropagationDirectiveModule } from '@rxap/directives';


@NgModule({
  declarations: [DarkModeToggleButtonComponent],
  imports: [
    MatButtonModule,
    MatIconModule,
    CommonModule,
    StopPropagationDirectiveModule,
  ],
  exports: [DarkModeToggleButtonComponent]
})
export class DarkModeToggleButtonComponentModule { }
