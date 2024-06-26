import { NormalizeTypeImport } from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  Normalized,
} from '@rxap/utilities';
import {
  BaseFormControl,
  NormalizedBaseFormControl,
} from './base-form-control';

import { FormControlKinds } from './form-control-kind';
import {
  FormField,
  FormFieldFormControl,
  NormalizedFormFieldFormControl,
  NormalizeFormFieldFormControl,
} from './form-field-form-control';

export interface DateFormControl extends FormFieldFormControl {
  placeholder?: string;
  formField?: FormField;
}

export interface NormalizedDateFormControl
  extends Omit<Readonly<Normalized<DateFormControl>>, keyof NormalizedFormFieldFormControl>,
          NormalizedFormFieldFormControl {
  kind: FormControlKinds.DATE;
}

export function IsDateFormControlOptions(options: BaseFormControl): options is DateFormControl {
  return options.kind === FormControlKinds.DATE;
}

export function IsNormalizedDateFormControlOptions(template: NormalizedBaseFormControl): template is NormalizedDateFormControl {
  return template.kind === FormControlKinds.DATE;
}

export function NormalizeDateFormControl(
  control: DateFormControl,
): NormalizedDateFormControl {
  const type = NormalizeTypeImport(control.type, 'Date');
  const validatorList = control.validatorList ?? [];
  const importList = control.importList ?? [];
  CoerceArrayItems(importList, [
    {
      name: 'MatInputModule',
      moduleSpecifier: '@angular/material/input',
    },
    {
      name: 'MatDatepickerModule',
      moduleSpecifier: '@angular/material/datepicker',
    }
  ], (a, b) => a.name === b.name);
  return Object.freeze({
    ...NormalizeFormFieldFormControl(control, importList, validatorList, type, false),
    validatorList,
    kind: FormControlKinds.DATE,
    placeholder: control.placeholder ?? null,
  });
}
