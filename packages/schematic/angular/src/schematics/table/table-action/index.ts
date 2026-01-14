import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceTableActionRule } from '@rxap/schematics-ts-morph';
import { join } from 'path';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import { AssertTableComponentExists } from '../../../lib/rules/assert-table-component-exists';
import {
  NormalizedTableActionOptions,
  NormalizeTableActionOptions,
} from './normalize-table-action-options';
import { TableActionOptions } from './schema';

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
