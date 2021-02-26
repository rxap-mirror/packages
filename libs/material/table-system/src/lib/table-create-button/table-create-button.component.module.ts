import { NgModule } from '@angular/core';
import { TableCreateButtonComponent } from './table-create-button.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * @deprecated use TableCreateButtonDirective instead
 */
@NgModule({
  declarations: [ TableCreateButtonComponent ],
  imports: [
    MatButtonModule,
    MatIconModule
  ],
  exports:      [ TableCreateButtonComponent ]
})
export class TableCreateButtonComponentModule {
}
