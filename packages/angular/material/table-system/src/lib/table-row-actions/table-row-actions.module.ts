import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ConfirmModule } from '@rxap/components';
import { TableRowActionExecutingDirective } from './table-row-action-executing.directive';
import { TableRowActionDirective } from './table-row-action.directive';
import { TableRowHeaderActionDirective } from './table-row-header-action.directive';
import { RowActionCheckPipe } from './row-action-check.pipe';

@NgModule({
  imports: [
    TableRowActionDirective,
    TableRowActionExecutingDirective,
    TableRowHeaderActionDirective,
    RowActionCheckPipe,
    ConfirmModule,
  ],
  exports: [
    TableRowActionDirective,
    TableRowHeaderActionDirective,
    TableRowActionExecutingDirective,
    RowActionCheckPipe,
    MatTooltipModule,
    MatButtonModule,
    ConfirmModule,
    MatIconModule,
    MatProgressBarModule,
    CommonModule,
  ],
})
export class TableRowActionsModule {}
