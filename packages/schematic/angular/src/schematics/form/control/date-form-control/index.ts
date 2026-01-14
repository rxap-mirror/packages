import { chain } from '@angular-devkit/schematics';
import { Normalized } from '@rxap/utilities';
import {
  DateFormControl,
  NormalizeDateFormControl,
  NormalizedDateFormControl,
} from '../../../../lib/form/control/date-form-control';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from '../../form-control';
import { FormControlOptions } from '../../form-control/schema';
import { DateFormControlOptions } from './schema';

export type NormalizedDateFormControlOptions = Readonly<Normalized<Omit<DateFormControlOptions, keyof FormControlOptions | keyof DateFormControl>>> & NormalizedFormControlOptions & NormalizedDateFormControl;


export function NormalizeDateFormControlOptions(
  options: DateFormControlOptions,
): NormalizedDateFormControlOptions {
  return Object.freeze({
    ...NormalizeFormControlOptions(options),
    ...NormalizeDateFormControl(options),
  });
}

function printOptions(options: NormalizedDateFormControlOptions) {
  PrintAngularOptions('date-form-control', options);
}

export default function (options: DateFormControlOptions) {
  const normalizedOptions = NormalizeDateFormControlOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:date-form-control]'.green),
      () => console.groupEnd(),
    ]);
  };
}
