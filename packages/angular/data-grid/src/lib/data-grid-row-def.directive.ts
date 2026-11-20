import {
  Directive,
  input,
  contentChild
} from '@angular/core';
import { DataGridCellDefDirective } from './data-grid-cell-def.directive';
import { DataGridHeaderCellDefDirective } from './data-grid-header-cell-def.directive';
import { DataGridEditCellDefDirective } from './data-grid-edit-cell-def.directive';

@Directive({
  selector: '[rxapDataGridRowDef]',
  standalone: true,
})
export class DataGridRowDefDirective<T extends Record<string, any>> {

  public readonly data = input<any | null>(null);

  public readonly name = input<string>(undefined, { alias: "rxapDataGridRowDef" });

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
  public readonly flip = input(false);

  public readonly cell = contentChild(DataGridCellDefDirective);

  public readonly headerCell = contentChild(DataGridHeaderCellDefDirective);

  public readonly editCell = contentChild(DataGridEditCellDefDirective);

  public get isSubHeader() {
    return !this.name();
  }

}
