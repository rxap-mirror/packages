import { NgModule } from '@angular/core';
import { TableColumnMenuComponent } from './table-column-menu.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TableColumnOptionComponent } from './table-column-option/table-column-option.component';
import { StopPropagationDirectiveModule } from '@rxap/directives';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [ TableColumnMenuComponent, TableColumnOptionComponent ],
  imports:      [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    CommonModule,
    MatCheckboxModule,
    StopPropagationDirectiveModule,
    FlexLayoutModule
  ],
  exports:      [ TableColumnMenuComponent, TableColumnOptionComponent, MatMenuModule ]
})
export class TableColumnMenuComponentModule {}
