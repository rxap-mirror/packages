import { Normalized } from '@rxap/utilities';
import {
  DialogAction,
  NormalizedDialogAction,
  NormalizeDialogActionList,
} from '../../dialog-action';
import { ToTitle } from '../../to-title';
import { TableActionKind } from '../table-action-kind';
import {
  BaseTableAction,
  NormalizeBaseTableAction,
  NormalizedBaseTableAction,
} from './base-table-action';


export interface DialogTableAction extends BaseTableAction {
  withoutBody?: boolean;
  actionList?: Array<string | DialogAction>;
  title?: string;
}

export interface NormalizedDialogTableAction
  extends Readonly<Normalized<Omit<DialogTableAction, keyof BaseTableAction | 'actionList'>> & NormalizedBaseTableAction> {
  kind: TableActionKind.DIALOG;
  actionList: ReadonlyArray<NormalizedDialogAction>;
  title: string;
}

export function NormalizeDialogTableAction(
  tableAction: Readonly<DialogTableAction>,
): NormalizedDialogTableAction {
  if (!tableAction.title) {
    throw new Error('The title property is required for a dialog table action');
  }
  const actionList = tableAction.actionList?.slice() ?? [];
  if (actionList.length === 0) {
    actionList.push({
      role: 'close',
      label: 'Cancel',
    });
    actionList.push({ role: 'submit' });
  }
  return Object.freeze({
    ...NormalizeBaseTableAction(tableAction),
    kind: TableActionKind.DIALOG,
    withoutBody: tableAction.withoutBody ?? false,
    title: tableAction.title,
    actionList: NormalizeDialogActionList(actionList),
  });
}
