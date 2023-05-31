import {
  Directive,
  Input,
  ContentChild
} from '@angular/core';
import { DataGridCellDefDirective } from './data-grid-cell-def.directive';
import { DataGridHeaderCellDefDirective } from './data-grid-header-cell-def.directive';
import { Required } from '@rxap/utilities';
import { DataGridEditCellDefDirective } from './data-grid-edit-cell-def.directive';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector:   '[rxapDataGridRowDef]',
  standalone: true
})
export class DataGridRowDefDirective<T extends Record<string, any>> {

  @Input()
  public data: any | null = null;

  @Input('rxapDataGridRowDef')
  @Required
  public name!: string;

  @ContentChild(DataGridCellDefDirective)
  public cell?: DataGridCellDefDirective<T>;

  @ContentChild(DataGridHeaderCellDefDirective)
  public headerCell?: DataGridHeaderCellDefDirective;

  @ContentChild(DataGridEditCellDefDirective)
  public editCell?: DataGridEditCellDefDirective<T>;

}
