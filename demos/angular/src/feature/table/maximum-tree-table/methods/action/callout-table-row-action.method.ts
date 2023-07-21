import { Method } from '@rxap/pattern';
import { Injectable } from '@angular/core';
import {
  TableActionMethod,
  TableRowActionTypeMethod,
} from '@rxap/material-table-system';
import { IMaximumTreeTable } from '../../maximum-tree-table';

@Injectable()
@TableActionMethod({
  type: 'callout',
  refresh: false,
  confirm: false,
  priority: 0,
  tooltip: $localize`Callout`,
})
export class CalloutTableRowActionMethod implements Method, TableRowActionTypeMethod<IMaximumTreeTable> {
  async call(parameters: IMaximumTreeTable): Promise<unknown> {
    console.log(`action row type: callout`, parameters);
    return parameters;
  }
}
