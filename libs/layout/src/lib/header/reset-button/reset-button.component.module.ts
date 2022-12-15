import { NgModule } from '@angular/core';
import { ResetButtonComponent } from './reset-button.component';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';


@NgModule({
  declarations: [ResetButtonComponent],
  imports: [
    MatIconModule,
    MatButtonModule
  ],
  exports: [ResetButtonComponent]
})
export class ResetButtonComponentModule { }
