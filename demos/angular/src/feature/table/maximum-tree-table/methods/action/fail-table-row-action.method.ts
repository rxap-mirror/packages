import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import {
  TableActionMethod,
  TableRowActionTypeMethod,
} from '@rxap/material-table-system';
import { IMaximumTreeTable } from '../../maximum-tree-table';

@Injectable()
@TableActionMethod({
  type: 'fail',
  refresh: false,
  confirm: false,
  priority: 0,
  tooltip: $localize`Fail`,
  errorMessage: 'Failure',
})
export class FailTableRowActionMethod implements Method, TableRowActionTypeMethod<IMaximumTreeTable> {
  async call(parameters: IMaximumTreeTable): Promise<unknown> {
    console.log(`action row type: fail`, parameters);
    return parameters;
  }
}
