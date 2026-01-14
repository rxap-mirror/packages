import { chain } from '@angular-devkit/schematics';
import { EnforceUseFormControlOrderRule } from '@rxap/schematics-ts-morph';
import { PrintAngularOptions } from '../../../../lib/print-angular-options';
import {
  NormalizedSelectFormControlOptions,
  NormalizeSelectFormControlOptions,
} from './normalize-select-form-control-options';
import { optionsRule } from './options/options-rule';
import { SelectFormControlOptions } from './schema';

function printOptions(options: NormalizedSelectFormControlOptions) {
  PrintAngularOptions('select-form-control', options);
}

export default function (options: SelectFormControlOptions) {
  const normalizedOptions = NormalizeSelectFormControlOptions(options);
  printOptions(normalizedOptions);
  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:select-form-control]'.green),
      optionsRule(normalizedOptions),
      EnforceUseFormControlOrderRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
