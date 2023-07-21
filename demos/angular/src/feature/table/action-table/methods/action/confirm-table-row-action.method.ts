import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import {
  TableActionMethod,
  TableRowActionTypeMethod,
} from '@rxap/material-table-system';
import { IActionTable } from '../../action-table';

@Injectable()
@TableActionMethod({
  type: 'confirm',
  refresh: false,
  confirm: true,
  priority: 0,
  tooltip: $localize`Confirm`,
  successMessage: 'Success',
})
export class ConfirmTableRowActionMethod implements Method, TableRowActionTypeMethod<IActionTable> {
  async call(parameters: IActionTable): Promise<unknown> {
    console.log(`action row type: confirm`, parameters);
    return parameters;
  }
}
