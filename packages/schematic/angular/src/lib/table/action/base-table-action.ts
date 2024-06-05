import { dasherize } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  CssClass,
  NormalizeCssClass,
  NormalizedCssClass,
} from '../../css-class';
import { ToTitle } from '../../to-title';
import { TableActionKind } from '../table-action-kind';


export interface BaseTableAction {
  kind?: TableActionKind;
  type: string;
  refresh?: boolean;
  confirm?: boolean;
  tooltip?: string;
  errorMessage?: string;
  successMessage?: string;
  priority?: number;
  checkFunction?: string;
  inHeader?: boolean;
  color?: string;
  cssClass?: CssClass;
}

export interface NormalizedBaseTableAction
  extends Readonly<Normalized<BaseTableAction>> {
  cssClass: NormalizedCssClass;
  kind: TableActionKind;
}

export function NormalizeBaseTableAction(
  tableAction: Readonly<BaseTableAction>,
): NormalizedBaseTableAction {
  return Object.freeze({
    kind: tableAction.kind ?? TableActionKind.DEFAULT,
    type: dasherize(tableAction.type),
    tooltip: tableAction.tooltip ?? ToTitle(tableAction.type),
    errorMessage: tableAction.errorMessage ?? null,
    successMessage: tableAction.successMessage ?? null,
    checkFunction: tableAction.checkFunction ?? null,
    color: tableAction.color ?? null,
    cssClass: NormalizeCssClass(tableAction.cssClass),
    refresh: tableAction.refresh ?? false,
    confirm: tableAction.confirm ?? false,
    priority: tableAction.priority ?? 0,
    inHeader: tableAction.inHeader ?? false,
  });
}
