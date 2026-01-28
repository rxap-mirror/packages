import {
  InputFormControl,
  NormalizedInputFormControl,
  NormalizeInputFormControl,
} from '@rxap/schematic-angular';
import { Normalized } from '@rxap/utilities';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control/normalize-form-control-options';
import { FormControlOptions } from '../../form-control/schema';
import { InputFormControlOptions } from './schema';

export type NormalizedInputFormControlOptions =
  Readonly<Normalized<Omit<InputFormControlOptions, keyof FormControlOptions | keyof InputFormControl>>>
  & NormalizedFormControlOptions & NormalizedInputFormControl;

export function NormalizeInputFormControlOptions(
  options: InputFormControlOptions,
): NormalizedInputFormControlOptions {
  const normalized = NormalizeFormControlOptions(options);
  return Object.freeze({
    ...normalized,
    ...NormalizeInputFormControl(options, normalized.backend),
  });
}