import {
  AngularOptions,
  NavigationTableAction,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedNavigationTableAction,
  NormalizeNavigationTableAction,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
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