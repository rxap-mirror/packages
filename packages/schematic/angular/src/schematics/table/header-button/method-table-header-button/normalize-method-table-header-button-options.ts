import {
  AngularOptions,
  MethodHeaderButton,
  NormalizeAngularOptions,
  NormalizedAngularOptions,
  NormalizedMethodHeaderButton,
  NormalizeMethodHeaderButton,
} from '@rxap/schematic-angular';
import {
  CoerceSuffix,
  dasherize,
  Normalized,
} from '@rxap/utilities';
import { MethodTableHeaderButtonOptions } from './schema';

export type NormalizedFormTableHeaderButtonOptions = Readonly<Normalized<Omit<MethodTableHeaderButtonOptions, keyof AngularOptions | keyof MethodHeaderButton>> & NormalizedAngularOptions & NormalizedMethodHeaderButton>;

export function NormalizeMethodTableHeaderButtonOptions(
  options: Readonly<MethodTableHeaderButtonOptions>,
): NormalizedFormTableHeaderButtonOptions {
  const normalizedAngularOptions = NormalizeAngularOptions(options);
  const normalizedTableHeaderButton = NormalizeMethodHeaderButton(options, options.tableName);
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