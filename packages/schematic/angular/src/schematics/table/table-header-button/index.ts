import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceTableHeaderButtonMethodRule } from '@rxap/schematics-ts-morph';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import { AssertTableComponentExists } from '../../../lib/rules/assert-table-component-exists';
import {
  NormalizedTableHeaderButtonOptions,
  NormalizeTableHeaderButtonOptions,
} from './normalize-table-header-button-options';
import { TableHeaderButtonOptions } from './schema';

function printOptions(options: NormalizedTableHeaderButtonOptions) {
  PrintAngularOptions('table-header-button', options);
}

export default function (options: TableHeaderButtonOptions) {
  const normalizedOptions = NormalizeTableHeaderButtonOptions(options);
  const {
    refresh,
    confirm,
    tooltip,
    errorMessage,
    successMessage,
    tableName,
    project,
    feature,
    shared,
    directory,
    overwrite,
  } = normalizedOptions;

  printOptions(normalizedOptions);

  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:table-header-button]\x1b[0m'),
      () => console.log('Coerce table header button method ...'),
      CoerceTableHeaderButtonMethodRule({
        project,
        feature,
        shared,
        directory,
        overwrite,
        tableName,
        refresh,
        confirm,
        tooltip,
        errorMessage,
        successMessage,
      }),
      () => console.groupEnd(),
    ]);
  };
}
