import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import {
  TableActionMethod,
  TableRowActionTypeMethod,
} from '@rxap/material-table-system';
import { IMaximumTreeTable } from '../../maximum-tree-table';

@Injectable()
@TableActionMethod({
  type: 'confirm',
  refresh: false,
  confirm: true,
  priority: 0,
  tooltip: $localize`Confirm`,
  successMessage: 'Success',
})
export class ConfirmTableRowActionMethod implements Method, TableRowActionTypeMethod<IMaximumTreeTable> {
  async call(parameters: IMaximumTreeTable): Promise<unknown> {
    console.log(`action row type: confirm`, parameters);
    return parameters;
  }
}
