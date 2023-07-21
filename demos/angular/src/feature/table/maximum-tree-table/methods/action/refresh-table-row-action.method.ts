import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import {
  TableActionMethod,
  TableRowActionTypeMethod,
} from '@rxap/material-table-system';
import { IMaximumTreeTable } from '../../maximum-tree-table';

@Injectable()
@TableActionMethod({
  type: 'refresh',
  refresh: true,
  confirm: false,
  priority: 0,
  tooltip: $localize`Refresh`,
})
export class RefreshTableRowActionMethod implements Method, TableRowActionTypeMethod<IMaximumTreeTable> {
  async call(parameters: IMaximumTreeTable): Promise<unknown> {
    console.log(`action row type: refresh`, parameters);
    return parameters;
  }
}
