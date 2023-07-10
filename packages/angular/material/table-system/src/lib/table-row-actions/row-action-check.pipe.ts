import {
  Inject,
  Optional,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { coerceArray } from '@rxap/utilities';
import { TableRowActionTypeMethod } from './types';
import { RXAP_TABLE_ROW_ACTION_METHOD } from './tokens';
import {
  GetTableRowActionCheckFunction,
  HasTableRowActionCheckFunction,
  IsTableRowActionTypeMethod,
} from './table-row-action.method';

@Pipe({
  name: 'rxapRowActionCheck',
  standalone: true,
})
export class RowActionCheckPipe<RowType extends Record<string, unknown> = Record<string, unknown>> implements PipeTransform {

  private readonly actionMethodList: Array<TableRowActionTypeMethod<RowType>>;

  constructor(
    @Optional()
    @Inject(RXAP_TABLE_ROW_ACTION_METHOD)
      tableRowActionMethodList: Array<TableRowActionTypeMethod<RowType>> | TableRowActionTypeMethod<RowType> | null,
  ) {
    this.actionMethodList = coerceArray(tableRowActionMethodList);
  }

  transform(value: RowType | RowType[], type: string): boolean {

    if (!type) {
      throw new Error(`The provided type is empty '${type}'`);
    }

    const actionMethodList = this.actionMethodList.filter(IsTableRowActionTypeMethod(type));

    if (actionMethodList.length > 1) {
      throw new Error(`Multiple (${actionMethodList.length}) action method with the same type '${type}' found`);
    }

    if (actionMethodList.length === 0) {
      throw new Error(`Could not find a action method with the type '${type}'`);
    }

    const actionMethod = actionMethodList[0];

    if (HasTableRowActionCheckFunction(actionMethod)) {
      const checkFunction = GetTableRowActionCheckFunction(actionMethod);
      const input = coerceArray(value);
      return input.length !== 0 && input.every(checkFunction);
    }

    return true;
  }

}
