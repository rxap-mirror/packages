import {
  AngularOptions,
  NormalizedTableSelectFormControl,
  NormalizeTableSelectFormControl,
} from '@rxap/schematic-angular';
import { BuildNestControllerName } from '@rxap/schematics-ts-morph';
import {
  NonNullableSelected,
  Normalized,
} from '@rxap/utilities';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control/normalize-form-control-options';
import { TableSelectFormControlOptions } from './schema';

export type NormalizedTableSelectFormControlOptions = NonNullableSelected<Readonly<Normalized<Omit<TableSelectFormControlOptions, keyof AngularOptions | 'columnList' | 'propertyList'>>> & NormalizedFormControlOptions & NormalizedTableSelectFormControl, 'controllerName'>

export function NormalizeTableSelectFormControlOptions(
  options: TableSelectFormControlOptions,
): NormalizedTableSelectFormControlOptions {
  const normalizedOptions = NormalizeFormControlOptions(options);
  return Object.freeze({
    ...normalizedOptions,
    ...NormalizeTableSelectFormControl(options),
    controllerName: BuildNestControllerName(normalizedOptions),
  });
}