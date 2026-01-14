import {
  AngularOptions,
  HeaderButton,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedHeaderButton,
  NormalizeHeaderButton,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/schematics-utilities';
import { Normalized } from '@rxap/utilities';
import { TableHeaderButtonOptions } from './schema';

export type NormalizedTableHeaderButtonOptions = Readonly<Normalized<Omit<TableHeaderButtonOptions, keyof AngularOptions | keyof HeaderButton>> & NormalizedAngularOptions & NormalizedHeaderButton>

export function NormalizeTableHeaderButtonOptions(
  options: Readonly<TableHeaderButtonOptions>,
): NormalizedTableHeaderButtonOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedTableHeaderButton = NormalizeHeaderButton(options, options.tableName);
  if (!normalizedTableHeaderButton) {
    throw new Error('FATAL: should never happen');
  }
  const tableName = CoerceSuffix(dasherize(options.tableName), '-table');
  return Object.freeze({
    ...normalizedTableHeaderButton,
    ...normalizedAngularOptions,
    tableName,
  });
}