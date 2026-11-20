import {
  Directive,
  input
} from '@angular/core';
import { AbstractTableRowAction } from './abstract-table-row-action';

@Directive({
  selector: 'button[rxapTableRowAction]',
  standalone: true,
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [ 'errorMessage', 'successMessage', 'refresh', 'color' ],
})
export class TableRowActionDirective<Data extends Record<string, any>> extends AbstractTableRowAction<Data> {


  public readonly type = input.required<string>({ alias: "rxapTableRowAction" });

  public readonly element = input.required<Data>();


  protected getElementList(): Data[] {
    return [ this.element() ];
  }

}
