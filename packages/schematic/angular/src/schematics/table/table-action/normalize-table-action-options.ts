import {
  AngularOptions,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedTableAction,
  NormalizeTableAction,
  TableAction,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { TableActionOptions } from './schema';

export type NormalizedTableActionOptions =
  Readonly<Normalized<Omit<TableActionOptions, keyof AngularOptions | keyof TableAction>>> & NormalizedAngularOptions
  & NormalizedTableAction;

export function NormalizeTableActionOptions(
  options: Readonly<TableActionOptions>,
): NormalizedTableActionOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  // TODO: Fix this type assertion
  const normalizedTableRowAction = NormalizeTableAction(options);
  const tableName = CoerceSuffix(dasherize(options.tableName), '-table');
  return Object.freeze({
    ...normalizedTableRowAction,
    ...normalizedAngularOptions,
    tableName,
  });
}