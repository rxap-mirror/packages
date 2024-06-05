import { Normalized } from '@rxap/utilities';
import { TableActionKind } from '../table-action-kind';
import {
  BaseTableAction,
  NormalizeBaseTableAction,
  NormalizedBaseTableAction,
} from './base-table-action';


export interface NavigationTableAction extends BaseTableAction {

}

export interface NormalizedNavigationTableAction
  extends Readonly<Normalized<Omit<NavigationTableAction, keyof BaseTableAction>> & NormalizedBaseTableAction> {
  kind: TableActionKind.DIALOG;
}

export function NormalizeNavigationTableAction(
  tableAction: Readonly<NavigationTableAction>,
): NormalizedNavigationTableAction {
  return Object.freeze({
    ...NormalizeBaseTableAction(tableAction),
    kind: TableActionKind.DIALOG,
  });
}
