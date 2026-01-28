import { BackendOptions } from '../backend/backend-options';
import {
  BaseTableAction,
  NormalizeBaseTableAction,
  NormalizedBaseTableAction,
} from './action/base-table-action';
import {
  DialogTableAction,
  NormalizedDialogTableAction,
  NormalizeDialogTableAction,
} from './action/dialog-table-action';
import {
  FormTableAction,
  NormalizedFormTableAction,
  NormalizeFormTableAction,
} from './action/form-table-action';
import {
  NavigationTableAction,
  NormalizedNavigationTableAction,
  NormalizeNavigationTableAction,
} from './action/navigation-table-action';
import {
  NormalizedOpenApiTableAction,
  NormalizeOpenApiTableAction,
  OpenApiTableAction,
} from './action/open-api-table-action';
import {
  NormalizedOperationTableAction,
  NormalizeOperationTableAction,
  OperationTableAction,
} from './action/operation-table-action';
import { TableActionKind } from './table-action-kind';

export type TableAction = BaseTableAction | DialogTableAction | FormTableAction | NavigationTableAction
  | OpenApiTableAction | OperationTableAction;

export type NormalizedTableAction = NormalizedBaseTableAction | NormalizedDialogTableAction | NormalizedFormTableAction
  | NormalizedNavigationTableAction | NormalizedOpenApiTableAction | NormalizedOperationTableAction;

export function NormalizeTableAction(
  action: Readonly<TableAction>,
  defaultKind: TableActionKind = TableActionKind.DEFAULT,
  backend: BackendOptions
): NormalizedTableAction {
  switch (action.kind ?? defaultKind) {
    case TableActionKind.DIALOG:
      return NormalizeDialogTableAction(action);
    case TableActionKind.FORM:
      return NormalizeFormTableAction(action, backend);
    case TableActionKind.NAVIGATION:
      return NormalizeNavigationTableAction(action);
    case TableActionKind.OPEN_API:
      return NormalizeOpenApiTableAction(action);
    case TableActionKind.OPERATION:
      return NormalizeOperationTableAction(action);
    case TableActionKind.DEFAULT:
    default:
      return NormalizeBaseTableAction(action);
  }
}

export function NormalizeTableActionList(
  actionList: ReadonlyArray<Readonly<TableAction>> = [],
  backend: BackendOptions
): ReadonlyArray<NormalizedTableAction> {
  return Object.freeze((
    actionList?.map(action => NormalizeTableAction(action, undefined, backend)) ?? []
  ));
}
