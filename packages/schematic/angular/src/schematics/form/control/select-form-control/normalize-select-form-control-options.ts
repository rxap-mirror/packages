import {
  NormalizedSelectFormControl,
  NormalizeSelectFormControl,
  SelectFormControl,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control/normalize-form-control-options';
import { FormControlOptions } from '../../form-control/schema';
import { SelectFormControlOptions } from './schema';

export type NormalizedSelectFormControlOptions =
  Readonly<Normalized<Omit<SelectFormControlOptions, keyof SelectFormControl | keyof FormControlOptions>>>
  & NormalizedFormControlOptions & NormalizedSelectFormControl;

export function NormalizeSelectFormControlOptions(
  options: SelectFormControlOptions,
): NormalizedSelectFormControlOptions {
  return Object.freeze({
    ...NormalizeFormControlOptions(options),
    ...NormalizeSelectFormControl(options),
  });
}