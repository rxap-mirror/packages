import { NgModule } from '@angular/core';
import { TableColumnMenuComponent } from './table-column-menu.component';
import { TableShowArchivedSlideComponent } from './table-show-archived-slide/table-show-archived-slide.component';
import { TableColumnOptionComponent } from './table-column-option/table-column-option.component';

@NgModule({
  imports: [
    TableColumnMenuComponent,
    TableShowArchivedSlideComponent,
    TableColumnOptionComponent,
  ],
  exports: [
    TableColumnMenuComponent,
    TableShowArchivedSlideComponent,
    TableColumnOptionComponent,
  ],
})
export class TableColumnMenuModule {}
