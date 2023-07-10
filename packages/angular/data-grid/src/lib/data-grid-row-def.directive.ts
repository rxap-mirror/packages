import {
  ContentChild,
  Directive,
  Input,
} from '@angular/core';
import { DataGridCellDefDirective } from './data-grid-cell-def.directive';
import { DataGridHeaderCellDefDirective } from './data-grid-header-cell-def.directive';
import { DataGridEditCellDefDirective } from './data-grid-edit-cell-def.directive';

@Directive({
  selector: '[rxapDataGridRowDef]',
  standalone: true,
})
export class DataGridRowDefDirective<T extends Record<string, any>> {

  @Input()
  public data: any | null = null;

  @Input('rxapDataGridRowDef')
  public name?: string;

  /**
   * true - the header and content cell are "rotated" by 90°. The header is above the content cell and both have a
   * colspan
   *
   * **flip: false**
   * Label | Value
   * --- | ---
   * Header | Content
   *
   * **flip: true**
   * Label | Value
   * --- | ---
   * Header (colspan 2)
   * Content (colspan 2)
   *
   */
  @Input()
  public flip = false;

  @ContentChild(DataGridCellDefDirective)
  public cell?: DataGridCellDefDirective<T>;

  @ContentChild(DataGridHeaderCellDefDirective)
  public headerCell?: DataGridHeaderCellDefDirective;

  @ContentChild(DataGridEditCellDefDirective)
  public editCell?: DataGridEditCellDefDirective<T>;

  public get isSubHeader() {
    return !this.name;
  }

}
