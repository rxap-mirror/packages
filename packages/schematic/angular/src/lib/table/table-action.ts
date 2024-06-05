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
  column: Readonly<TableAction>,
): NormalizedTableAction {
  switch (column.kind) {
    case TableActionKind.DIALOG:
      return NormalizeDialogTableAction(column);
    case TableActionKind.FORM:
      return NormalizeFormTableAction(column);
    case TableActionKind.NAVIGATION:
      return NormalizeNavigationTableAction(column);
    case TableActionKind.OPEN_API:
      return NormalizeOpenApiTableAction(column);
    case TableActionKind.OPERATION:
      return NormalizeOperationTableAction(column);
    case TableActionKind.DEFAULT:
    default:
      return NormalizeBaseTableAction(column);
  }
}

export function NormalizeTableActionList(
  columnList?: ReadonlyArray<Readonly<TableAction>>,
): ReadonlyArray<NormalizedTableAction> {
  return Object.freeze((
    columnList?.map(NormalizeTableAction) ?? []
  ));
}
