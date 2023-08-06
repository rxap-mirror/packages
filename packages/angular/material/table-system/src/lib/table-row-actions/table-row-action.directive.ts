import {
  Directive,
  Input,
} from '@angular/core';
import { AbstractTableRowAction } from './abstract-table-row-action';

@Directive({
  selector: 'button[rxapTableRowAction]',
  standalone: true,
})
export class TableRowActionDirective<Data extends Record<string, any>> extends AbstractTableRowAction<Data> {


  @Input({
    required: true,
    alias: 'rxapTableRowAction',
  })
  public type!: string;

  @Input({ required: true })
  public element!: Data;


  protected getElementList(): Data[] {
    return [ this.element ];
  }

}
