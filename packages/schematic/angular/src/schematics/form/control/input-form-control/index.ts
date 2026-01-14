import { chain } from '@angular-devkit/schematics';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import {
  NormalizedInputFormControlOptions,
  NormalizeInputFormControlOptions,
} from './normalize-input-form-control-options';
import { InputFormControlOptions } from './schema';


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
