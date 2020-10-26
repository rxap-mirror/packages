import {
  Directive,
  Input,
  ContentChild
} from '@angular/core';
import { DataGridCellDefDirective } from './data-grid-cell-def.directive';
import { DataGridHeaderCellDefDirective } from './data-grid-header-cell-def.directive';
import { Required } from '@rxap/utilities';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: '[rxapDataGridRowDef]',
})
export class DataGridRowDefDirective {

  @Input()
  public data: any | null = null;

  @Input('rxapDataGridRowDef')
  @Required
  public name!: string;

  @ContentChild(DataGridCellDefDirective)
  public cell?: DataGridCellDefDirective;

  @ContentChild(DataGridHeaderCellDefDirective)
  @Required
  public headerCell!: DataGridHeaderCellDefDirective;

}
