import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import {
  TableActionMethod,
  TableRowActionTypeMethod,
} from '@rxap/material-table-system';
import { IActionTable } from '../../action-table';

@Injectable()
@TableActionMethod({
  type: 'refresh',
  refresh: true,
  confirm: false,
  priority: 0,
  tooltip: $localize`Refresh`,
})
export class RefreshTableRowActionMethod implements Method, TableRowActionTypeMethod<IActionTable> {
  async call(parameters: IActionTable): Promise<unknown> {
    console.log(`action row type: refresh`, parameters);
    return parameters;
  }
}
