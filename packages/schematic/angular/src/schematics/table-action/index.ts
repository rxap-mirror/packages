import {
  TableActionOptions,
  TableRowAction,
} from './schema';
import {
  capitalize,
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  chain,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import {
  CoerceTableActionRule,
  HasTableComponent,
} from '@rxap/schematics-ts-morph';
import { join } from 'path';
import { PrintTableActionHtmlCode } from './print-table-action-html-code';

export interface NormalizedTableRowAction extends Required<TableRowAction> {
  tooltip: string | null;
  successMessage: string | null;
  errorMessage: string | null;
  checkFunction: string | null;
}

export function NormalizeTableRowAction(
  tableAction: TableRowAction,
): NormalizedTableRowAction {
  const type = dasherize(tableAction.type);
  const checkFunction = tableAction.checkFunction ?? null;
  return Object.seal({
    type,
    tooltip:
      tableAction.tooltip ??
      dasherize(type)
        .split('-')
        .map((part) => capitalize(part))
        .join(' '),
    errorMessage: tableAction.errorMessage ?? null,
    successMessage: tableAction.successMessage ?? null,
    checkFunction,
    refresh: tableAction.refresh ?? false,
    confirm: tableAction.confirm ?? false,
    priority: tableAction.priority ?? 0,
    inHeader: tableAction.inHeader ?? false,
  });
}

export interface NormalizedTableActionOptions
  extends Required<TableActionOptions> {
  tooltip: string | null;
  successMessage: string | null;
  errorMessage: string | null;
  checkFunction: string | null;
}

export function NormalizeTableActionOptions(
  options: Readonly<TableActionOptions>,
): Readonly<NormalizedTableActionOptions> {
  const tableName = CoerceSuffix(dasherize(options.tableName), '-table');
  let directory = options.directory ?? '';
  let shared = options.shared ?? false;
  let project = dasherize(options.project);
  const feature = dasherize(options.feature);
  if (project === 'shared') {
    shared = true;
  }
  if (shared) {
    project = 'shared';
    directory = '';
  }
  if (!directory.endsWith(tableName)) {
    directory = join(directory, tableName);
  }
  const normalizedTableRowAction = NormalizeTableRowAction(options);
  return Object.seal({
    ...normalizedTableRowAction,
    tableName,
    project,
    feature,
    shared,
    directory,
    override: options.override ?? false,
  });
}

export default function (options: TableActionOptions) {
  const normalizedOptions = NormalizeTableActionOptions(options);
  const {
    refresh,
    confirm,
    tooltip,
    errorMessage,
    successMessage,
    priority,
    checkFunction,
    tableName,
    project,
    feature,
    shared,
    directory,
    type,
  } = normalizedOptions;
  console.log(
    `===== Generating table action for type '${ type }' for project '${ project }' in feature '${ feature }' in directory '${ directory }' ...`,
  );
  return (host: Tree) => {
    if (
      !HasTableComponent(host, {
        project,
        feature,
        directory,
        name: tableName,
      })
    ) {
      throw new SchematicsException(
        `Could not find the table component '${ tableName }' in the project '${ project }' and feature '${ feature }' and directory '${ directory }'.`,
      );
    }

    return chain([
      CoerceTableActionRule({
        directory: join(directory, 'methods', 'action'),
        type,
        tableName,
        refresh,
        confirm,
        tooltip,
        errorMessage,
        successMessage,
        priority,
        checkFunction,
        project,
        feature,
      }),
      () => PrintTableActionHtmlCode(type),
    ]);
  };
}
