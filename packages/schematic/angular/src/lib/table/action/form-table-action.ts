import { Normalized } from '@rxap/utilities';
import { TableActionKind } from '../table-action-kind';
import {
  BaseTableAction,
  NormalizeBaseTableAction,
  NormalizedBaseTableAction,
} from './base-table-action';


export interface FormTableAction extends BaseTableAction {

}

export interface NormalizedFormTableAction
  extends Readonly<Normalized<Omit<FormTableAction, keyof BaseTableAction>> & NormalizedBaseTableAction> {
  kind: TableActionKind.DIALOG;
}

export function NormalizeFormTableAction(
  tableAction: Readonly<FormTableAction>,
): NormalizedFormTableAction {
  return Object.freeze({
    ...NormalizeBaseTableAction(tableAction),
    kind: TableActionKind.DIALOG,
  });
}
