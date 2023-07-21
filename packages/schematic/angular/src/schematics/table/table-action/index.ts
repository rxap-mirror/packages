import { TableActionOptions } from './schema';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceTableActionRule } from '@rxap/schematics-ts-morph';
import { join } from 'path';
import { Normalized } from '@rxap/utilities';
import {
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  PrintAngularOptions,
} from '../../../lib/angular-options';
import { NormalizeTableRowAction } from '../../../lib/table-row-action';
import { AssertTableComponentExists } from '../../../lib/assert-table-component-exists';

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

function printTableActionOptions(options: NormalizedTableActionOptions) {
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

  printTableActionOptions(normalizedOptions);

  return (host: Tree) => {
    AssertTableComponentExists(host, normalizedOptions);

    return chain([
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
    ]);
  };
}
