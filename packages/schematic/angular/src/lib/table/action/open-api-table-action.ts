import { Normalized } from '@rxap/utilities';
import { TableActionKind } from '../table-action-kind';
import {
  BaseTableAction,
  NormalizeBaseTableAction,
  NormalizedBaseTableAction,
} from './base-table-action';


export interface OpenApiTableAction extends BaseTableAction {

}

export interface NormalizedOpenApiTableAction
  extends Readonly<Normalized<Omit<OpenApiTableAction, keyof BaseTableAction>> & NormalizedBaseTableAction> {
  kind: TableActionKind.DIALOG;
}

export function NormalizeOpenApiTableAction(
  tableAction: Readonly<OpenApiTableAction>,
): NormalizedOpenApiTableAction {
  return Object.freeze({
    ...NormalizeBaseTableAction(tableAction),
    kind: TableActionKind.DIALOG,
  });
}
