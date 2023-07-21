import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import {
  TableActionMethod,
  TableRowActionTypeMethod,
} from '@rxap/material-table-system';
import { IActionTable } from '../../action-table';

@Injectable()
@TableActionMethod({
  type: 'fail',
  refresh: false,
  confirm: false,
  priority: 0,
  tooltip: $localize`Fail`,
  errorMessage: 'Failure',
})
export class FailTableRowActionMethod implements Method, TableRowActionTypeMethod<IActionTable> {
  async call(parameters: IActionTable): Promise<unknown> {
    console.log(`action row type: fail`, parameters);
    throw new Error('Failure');
  }
}
