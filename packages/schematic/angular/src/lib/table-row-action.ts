import { dasherize } from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
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
  options?: Record<string, any>;
}

export type NormalizedTableRowAction = Readonly<Normalized<TableRowAction>>;

export function NormalizeTableRowAction(
  tableAction: Readonly<TableRowAction>,
): NormalizedTableRowAction {
  return Object.seal({
    type: dasherize(tableAction.type),
    tooltip: tableAction.tooltip ?? ToTitle(tableAction.type),
    errorMessage: tableAction.errorMessage ?? null,
    successMessage: tableAction.successMessage ?? null,
    checkFunction: tableAction.checkFunction ?? null,
    refresh: tableAction.refresh ?? false,
    confirm: tableAction.confirm ?? false,
    priority: tableAction.priority ?? 0,
    inHeader: tableAction.inHeader ?? false,
    options: tableAction.options ?? null,
  });
}
