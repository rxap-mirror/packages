import {
  NormalizedTableSelectFormControl,
  NormalizeTableSelectFormControl,
  TableSelectFormControl,
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
import { FormControlOptions } from '../../form-control/schema';
import { AutocompleteTableSelectFormControlOptions } from './schema';

export type NormalizedTableSelectFormControlOptions = NonNullableSelected<Readonly<Normalized<Omit<AutocompleteTableSelectFormControlOptions, keyof FormControlOptions | keyof TableSelectFormControl>>> & NormalizedFormControlOptions & NormalizedTableSelectFormControl, 'controllerName'>

export function NormalizeTableSelectFormControlOptions(
  options: AutocompleteTableSelectFormControlOptions,
): NormalizedTableSelectFormControlOptions {
  const normalizedOptions = NormalizeFormControlOptions(options);
  return Object.freeze({
    ...normalizedOptions,
    ...NormalizeTableSelectFormControl(options),
    controllerName: BuildNestControllerName(normalizedOptions),
  });
}