import { chain } from '@angular-devkit/schematics';
import { CoerceFormDefinitionFormControl } from '@rxap/schematics-ts-morph';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import { formControlKind } from './form-control-kind';
import {
  NormalizedFormControlOptions,
  NormalizeFormControlOptions,
} from './normalize-form-control-options';
import { FormControlOptions } from './schema';
import 'colors';

function printOptions(options: NormalizedFormControlOptions) {
  PrintAngularOptions('form-control', options);
  console.log(`=== form: ${options.formName}`.blue);
}

export default function (options: FormControlOptions) {
  const normalizedOptions = NormalizeFormControlOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:form-control]'.green),
      () => console.log('Coerce control in form definition class ...'),
      CoerceFormDefinitionFormControl(normalizedOptions),
      formControlKind(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
