import { Normalized } from '@rxap/utilities';
import { TableActionKind } from '../table-action-kind';
import {
  BaseTableAction,
  NormalizeBaseTableAction,
  NormalizedBaseTableAction,
} from './base-table-action';


export interface OperationTableAction extends BaseTableAction {

}

export interface NormalizedOperationTableAction
  extends Readonly<Normalized<Omit<OperationTableAction, keyof BaseTableAction>> & NormalizedBaseTableAction> {
  kind: TableActionKind.DIALOG;
}

export function NormalizeOperationTableAction(
  tableAction: Readonly<OperationTableAction>,
): NormalizedOperationTableAction {
  return Object.freeze({
    ...NormalizeBaseTableAction(tableAction),
    kind: TableActionKind.DIALOG,
  });
}
