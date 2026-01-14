import { chain } from '@angular-devkit/schematics';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import {
  NormalizeDateFormControlOptions,
  NormalizedDateFormControlOptions,
} from './normalize-date-form-control-options';
import { DateFormControlOptions } from './schema';


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
