import { Normalized } from '@rxap/utilities';
import { TableActionKind } from '../table-action-kind';
import {
  BaseTableAction,
  NormalizeBaseTableAction,
  NormalizedBaseTableAction,
} from './base-table-action';


export interface NavigationTableAction extends BaseTableAction {
  route?: string;
  relativeTo?: boolean;
}

export interface NormalizedNavigationTableAction
  extends Readonly<Normalized<Omit<NavigationTableAction, keyof BaseTableAction>> & NormalizedBaseTableAction> {
  kind: TableActionKind.NAVIGATION;
  route: string;
}

export function NormalizeNavigationTableAction(
  tableAction: Readonly<NavigationTableAction>,
): NormalizedNavigationTableAction {
  if (!tableAction.route) {
    throw new Error('The route property is required for a navigation table action');
  }
  return Object.freeze({
    ...NormalizeBaseTableAction(tableAction),
    kind: TableActionKind.NAVIGATION,
    route: tableAction.route,
    relativeTo: tableAction.relativeTo ?? false,
  });
}
