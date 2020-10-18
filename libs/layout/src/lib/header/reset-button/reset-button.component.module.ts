import { NgModule } from '@angular/core';
import { ResetButtonComponent } from './reset-button.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [ResetButtonComponent],
  imports: [
    MatIconModule,
    MatButtonModule
  ],
  exports: [ResetButtonComponent]
})
export class ResetButtonComponentModule { }
