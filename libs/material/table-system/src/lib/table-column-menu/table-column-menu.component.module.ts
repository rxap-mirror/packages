import { NgModule } from '@angular/core';
import { TableColumnMenuComponent } from './table-column-menu.component';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { CommonModule } from '@angular/common';
import { MatLegacyCheckboxModule as MatCheckboxModule } from '@angular/material/legacy-checkbox';
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
