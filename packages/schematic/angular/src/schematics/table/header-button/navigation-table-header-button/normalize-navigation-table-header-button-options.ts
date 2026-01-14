import {
  AngularOptions,
  NavigationHeaderButton,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedNavigationHeaderButton,
  NormalizeNavigationHeaderButton,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { NavigationTableHeaderButtonOptions } from './schema';

export type NormalizedNavigationTableHeaderButtonOptions = Readonly<Normalized<Omit<NavigationTableHeaderButtonOptions, keyof AngularOptions | keyof NavigationHeaderButton>> & NormalizedAngularOptions & NormalizedNavigationHeaderButton>

export function NormalizeNavigationTableHeaderButtonOptions(
  options: Readonly<NavigationTableHeaderButtonOptions>,
): NormalizedNavigationTableHeaderButtonOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedTableHeaderButton = NormalizeNavigationHeaderButton(options, options.tableName);
  if (!normalizedTableHeaderButton) {
    throw new Error('FATAL: should never happen');
  }
  const tableName = CoerceSuffix(dasherize(options.tableName), '-table');
  return Object.freeze({
    ...normalizedAngularOptions,
    ...normalizedTableHeaderButton,
    tableName,
  });
}