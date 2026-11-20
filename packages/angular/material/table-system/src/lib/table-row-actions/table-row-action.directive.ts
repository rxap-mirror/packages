import {
  Directive,
  input,
} from '@angular/core';
import { AbstractTableRowAction } from './abstract-table-row-action';

@Directive({
  selector: 'button[rxapTableRowAction]',
  standalone: true,
})
export class TableRowActionDirective<Data extends Record<string, any>> extends AbstractTableRowAction<Data> {

  public readonly type = input.required<string>({ alias: 'rxapTableRowAction' });

  public readonly element = input.required<Data>();

  constructor() {
    super();
  }

  protected getElementList(): Data[] {
    return [ this.element() ];
  }

}
