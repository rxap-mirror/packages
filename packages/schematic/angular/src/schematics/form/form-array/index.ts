import { chain } from '@angular-devkit/schematics';
import { CoerceFormDefinitionFormArray } from '@rxap/schematics-ts-morph';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import { formControlKind } from './form-control-kind';
import { formDefinitionRule } from './form-definition-rule';
import {
  NormalizedFormArrayOptions,
  NormalizeFormArrayOptions,
} from './normalize-form-array-options';
import { FormArrayOptions } from './schema';
import 'colors';

function printOptions(options: NormalizedFormArrayOptions) {
  PrintAngularOptions('form-control', options);
  console.log(`=== form: ${options.formName}`.blue);
}

export default function (options: FormArrayOptions) {
  const normalizedOptions = NormalizeFormArrayOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:form-array]'.green),
      () => console.log('Coerce form array in form definition class ...'),
      CoerceFormDefinitionFormArray(normalizedOptions),
      formControlKind(normalizedOptions),
      formDefinitionRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
