import { dasherize } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import {
  CssClass,
  NormalizeCssClass,
  NormalizedCssClass,
} from './css-class';
import { ToTitle } from './to-title';

export interface TableRowAction {
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
  options?: Record<string, any>;
}

export interface NormalizedTableRowAction extends Readonly<Normalized<Omit<TableRowAction, 'cssClass'>>> {
  options: Record<string, any>;
  cssClass: NormalizedCssClass;
}

export function NormalizeTableRowAction(
  tableAction: Readonly<TableRowAction>,
): NormalizedTableRowAction {
  return Object.freeze({
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
    options: tableAction.options ?? {},
  });
}
