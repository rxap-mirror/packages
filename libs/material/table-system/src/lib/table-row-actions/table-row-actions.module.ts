import { NgModule } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmComponentModule } from '@rxap/components';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TableRowActionDirective } from './table-row-action.directive';
import { TableRowActionExecutingDirective } from './table-row-action-executing.directive';
import { TableRowHeaderActionDirective } from './table-row-header-action.directive';
import { CommonModule } from '@angular/common';


@NgModule({
  declarations: [
    TableRowActionDirective,
    TableRowActionExecutingDirective,
    TableRowHeaderActionDirective
  ],
  exports:      [
    TableRowActionDirective,
    TableRowHeaderActionDirective,
    TableRowActionExecutingDirective,
    MatTooltipModule,
    MatButtonModule,
    ConfirmComponentModule,
    MatIconModule,
    MatProgressBarModule,
    CommonModule
  ]
})
export class TableRowActionsModule {}
