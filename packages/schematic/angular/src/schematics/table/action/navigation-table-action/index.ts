import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceNavigationTableActionRule } from '@rxap/schematics-ts-morph';
import { join } from 'path';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import { AssertTableComponentExists } from '../../../../lib/rules/assert-table-component-exists';
import {
  NormalizedNavigationTableActionOptions,
  NormalizeNavigationTableActionOptions,
} from './normalize-navigation-table-action-options';
import { NavigationTableActionOptions } from './schema';

function printOptions(options: NormalizedNavigationTableActionOptions) {
  PrintAngularOptions('navigation-table-action', options);
}

export default function (options: NavigationTableActionOptions) {
  const normalizedOptions = NormalizeNavigationTableActionOptions(options);
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
    route,
    relativeTo,
  } = normalizedOptions;
  printOptions(normalizedOptions);
  return (host: Tree) => {

    AssertTableComponentExists(host, normalizedOptions);

    return chain([
      () => console.group('\x1b[32m[@rxap/schematics-angular:navigation-table-action]\x1b[0m'),
      CoerceNavigationTableActionRule({
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
        route,
        relativeTo,
      }),
      () => console.groupEnd(),
    ]);
  };
}
