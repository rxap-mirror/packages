import { chain } from '@angular-devkit/schematics';
import { Normalized } from '@rxap/utilities';
import { PrintAngularOptions } from '../../../../lib/angular-options';
import {
  NormalizedInputFormControl,
  NormalizeInputFormControl,
} from '../../../../lib/form/control/input-form-control';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control';
import { InputFormControlOptions } from './schema';

export type NormalizedInputFormControlOptions = Readonly<Normalized<InputFormControlOptions>> & NormalizedFormControlOptions & NormalizedInputFormControl


export function NormalizeInputFormControlOptions(
  options: InputFormControlOptions,
): NormalizedInputFormControlOptions {
  return Object.freeze({
    ...NormalizeFormControlOptions(options),
    ...NormalizeInputFormControl(options),
  });
}

function printOptions(options: NormalizedInputFormControlOptions) {
  PrintAngularOptions('input-form-control', options);
}

export default function (options: InputFormControlOptions) {
  const normalizedOptions = NormalizeInputFormControlOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:input-form-control]'.green),
      () => console.groupEnd(),
    ]);
  };
}
