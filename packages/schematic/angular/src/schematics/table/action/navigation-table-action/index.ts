import { NavigationTableActionOptions } from './schema';
import {
  chain,
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { join } from 'path';
import {
  CoerceNavigationTableActionRule,
  HasTableComponent,
} from '@rxap/schematics-ts-morph';
import { Normalized } from '@rxap/utilities';
import {
  NormalizedOperationTableActionOptions,
  NormalizeOperationTableActionOptions,
} from '../operation-table-action';

export type NormalizedNavigationTableActionOptions = Readonly<Normalized<NavigationTableActionOptions>>
  & NormalizedOperationTableActionOptions;

export function NormalizeNavigationTableActionOptions(
  options: NavigationTableActionOptions,
): NormalizedNavigationTableActionOptions {
  return {
    ...NormalizeOperationTableActionOptions(options),
    route: options.route ?? null,
  };
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
  } = normalizedOptions;
  console.log(
    `===== Generating navigation table action for type '${ type }' for project '${ project }' in feature '${ feature }' in directory '${ directory }' ...`,
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
      }),
    ]);
  };
}
