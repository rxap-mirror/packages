import { Normalized } from '@rxap/utilities';
import { TableActionKind } from '../table-action-kind';
import {
  BaseTableAction,
  NormalizeBaseTableAction,
  NormalizedBaseTableAction,
} from './base-table-action';


export type OperationTableAction = BaseTableAction

export interface NormalizedOperationTableAction
  extends Readonly<Normalized<Omit<OperationTableAction, keyof BaseTableAction>> & NormalizedBaseTableAction> {
  kind: TableActionKind.OPERATION;
}

export function NormalizeOperationTableAction(
  tableAction: Readonly<OperationTableAction>,
): NormalizedOperationTableAction {
  return Object.freeze({
    ...NormalizeBaseTableAction(tableAction),
    kind: TableActionKind.OPERATION,
  });
}
