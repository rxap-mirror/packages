import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceTableActionRule } from '@rxap/schematics-ts-morph';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { join } from 'path';
import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../lib/assert-table-component-exists';
import { NormalizeTableRowAction } from '../../../lib/table-row-action';
import { TableActionOptions } from './schema';

export type NormalizedTableActionOptions = Readonly<Normalized<TableActionOptions>> & NormalizedAngularOptions;

export function NormalizeTableActionOptions(
  options: Readonly<TableActionOptions>,
): NormalizedTableActionOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedTableRowAction = NormalizeTableRowAction(options);
  const tableName = CoerceSuffix(dasherize(options.tableName), '-table');
  return Object.seal({
    ...normalizedTableRowAction,
    ...normalizedAngularOptions,
    tableName,
  });
}

function printOptions(options: NormalizedTableActionOptions) {
  PrintAngularOptions('table-action', options);
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
    directory,
    type,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:table-action]\x1b[0m'),
      CoerceTableActionRule({
        directory: join(directory ?? '', 'methods', 'action'),
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
      () => console.groupEnd(),
    ]);
  };
}
