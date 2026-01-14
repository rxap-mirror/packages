import {
  DateFormControl,
  NormalizeDateFormControl,
  NormalizedDateFormControl,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control/normalize-form-control-options';
import { FormControlOptions } from '../../form-control/schema';
import { DateFormControlOptions } from './schema';

export type NormalizedDateFormControlOptions =
  Readonly<Normalized<Omit<DateFormControlOptions, keyof FormControlOptions | keyof DateFormControl>>>
  & NormalizedFormControlOptions & NormalizedDateFormControl;

export function NormalizeDateFormControlOptions(
  options: DateFormControlOptions,
): NormalizedDateFormControlOptions {
  return Object.freeze({
    ...NormalizeFormControlOptions(options),
    ...NormalizeDateFormControl(options),
  });
}