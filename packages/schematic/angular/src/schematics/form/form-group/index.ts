import { chain } from '@angular-devkit/schematics';
import { CoerceFormDefinitionFormGroup } from '@rxap/schematics-ts-morph';
import { PrintAngularOptions } from '../../../lib/print-angular-options';
import { formControlKind } from './form-control-kind';
import { formDefinitionRule } from './form-definition-rule';
import {
  NormalizedFormGroupOptions,
  NormalizeFormGroupOptions,
} from './normalize-form-group-options';
import { FormGroupOptions } from './schema';
import 'colors';

function printOptions(options: NormalizedFormGroupOptions) {
  PrintAngularOptions('form-control', options);
  console.log(`=== form: ${options.formName}`.blue);
}

export default function (options: FormGroupOptions) {
  const normalizedOptions = NormalizeFormGroupOptions(options);
  printOptions(normalizedOptions);

  return () => {
    return chain([
      () => console.group('[@rxap/schematics-angular:form-group]'.green),
      () => console.log('Coerce form group in form definition class ...'),
      CoerceFormDefinitionFormGroup(normalizedOptions),
      formControlKind(normalizedOptions),
      formDefinitionRule(normalizedOptions),
      () => console.groupEnd(),
    ]);
  };
}
