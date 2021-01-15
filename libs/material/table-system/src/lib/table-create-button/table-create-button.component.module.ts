import { NgModule } from '@angular/core';
import { TableCreateButtonComponent } from './table-create-button.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [ TableCreateButtonComponent ],
  imports:      [
    MatButtonModule,
    MatIconModule
  ],
  exports:      [ TableCreateButtonComponent ]
})
export class TableCreateButtonComponentModule {
}
