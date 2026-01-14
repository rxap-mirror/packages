import {
  AutocompleteFormControl,
  NormalizeAutocompleteFormControl,
  NormalizedAutocompleteFormControl,
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
import { AutocompleteFormControlOptions } from './schema';

export type NormalizedAutocompleteFormControlOptions = NonNullableSelected<Readonly<Normalized<Omit<AutocompleteFormControlOptions, keyof FormControlOptions | keyof AutocompleteFormControl>>> & NormalizedFormControlOptions & NormalizedAutocompleteFormControl, 'controllerName'>

export function NormalizeAutocompleteFormControlOptions(
  options: AutocompleteFormControlOptions,
): NormalizedAutocompleteFormControlOptions {
  const normalizedOptions = NormalizeFormControlOptions(options);
  return Object.freeze({
    ...normalizedOptions,
    ...NormalizeAutocompleteFormControl(options),
    controllerName: BuildNestControllerName(normalizedOptions),
  });
}