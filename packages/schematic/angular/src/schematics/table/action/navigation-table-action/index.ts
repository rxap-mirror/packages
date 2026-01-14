import {
  chain,
  Tree,
} from '@angular-devkit/schematics';
import { CoerceNavigationTableActionRule } from '@rxap/schematics-ts-morph';
import { Normalized } from '@rxap/utilities';
import { join } from 'path';
import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,

} from '../../../../lib/angular-options';
import { AssertTableComponentExists } from '../../../../lib/rules/assert-table-component-exists';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import {
  NavigationTableAction,
  NormalizedNavigationTableAction,
  NormalizeNavigationTableAction,
} from '../../../../lib/table/action/navigation-table-action';
import { NavigationTableActionOptions } from './schema';

export type NormalizedNavigationTableActionOptions = Readonly<Normalized<Omit<NavigationTableActionOptions, keyof NavigationTableAction | keyof AngularOptions>> & NormalizedNavigationTableAction & NormalizedAngularOptions>

export function NormalizeNavigationTableActionOptions(
  options: NavigationTableActionOptions,
): NormalizedNavigationTableActionOptions {
  return {
    ...NormalizeAngularOptions(options),
    ...NormalizeNavigationTableAction(options),
    tableName: options.tableName,
  };
}

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
