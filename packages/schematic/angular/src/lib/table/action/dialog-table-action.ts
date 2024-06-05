import { Normalized } from '@rxap/utilities';
import { TableActionKind } from '../table-action-kind';
import {
  BaseTableAction,
  NormalizeBaseTableAction,
  NormalizedBaseTableAction,
} from './base-table-action';


export interface DialogTableAction extends BaseTableAction {

}

export interface NormalizedDialogTableAction
  extends Readonly<Normalized<Omit<DialogTableAction, keyof BaseTableAction>> & NormalizedBaseTableAction> {
  kind: TableActionKind.DIALOG;
}

export function NormalizeDialogTableAction(
  tableAction: Readonly<DialogTableAction>,
): NormalizedDialogTableAction {
  return Object.freeze({
    ...NormalizeBaseTableAction(tableAction),
    kind: TableActionKind.DIALOG,
  });
}
