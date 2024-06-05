import { Normalized } from '@rxap/utilities';
import { TableActionKind } from '../table-action-kind';
import {
  BaseTableAction,
  NormalizeBaseTableAction,
  NormalizedBaseTableAction,
} from './base-table-action';


export interface OpenApiTableAction extends BaseTableAction {
  operationId?: string;
  body?: boolean | Record<string, string>;
  parameters?: boolean | Record<string, string>;
  scope?: string;
}

export interface NormalizedOpenApiTableAction
  extends Readonly<Normalized<Omit<OpenApiTableAction, keyof BaseTableAction>> & NormalizedBaseTableAction> {
  kind: TableActionKind.OPEN_API;
  body: boolean | Record<string, string>;
  parameters: boolean | Record<string, string>;
  operationId: string;
}

export function NormalizeOpenApiTableAction(
  tableAction: Readonly<OpenApiTableAction>,
): NormalizedOpenApiTableAction {
  if (!tableAction.operationId) {
    throw new Error('The operationId property is required for an open api table action');
  }
  return Object.freeze({
    ...NormalizeBaseTableAction(tableAction),
    kind: TableActionKind.OPEN_API,
    body: tableAction.body ?? false,
    parameters: tableAction.parameters ?? false,
    operationId: tableAction.operationId,
    scope: tableAction.scope ?? null,
  });
}
