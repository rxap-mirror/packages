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

export interface InputFormControl extends FormFieldFormControl {
  inputType?: string;
  placeholder?: string;
  formField?: FormField;
}

export interface NormalizedInputFormControl
  extends Omit<Readonly<Normalized<InputFormControl>>, keyof NormalizedFormFieldFormControl>,
          NormalizedFormFieldFormControl {
  kind: FormControlKinds.INPUT;
}

export function IsInputFormControlOptions(options: BaseFormControl): options is InputFormControl {
  return options.kind === FormControlKinds.INPUT;
}

export function IsNormalizedInputFormControlOptions(template: NormalizedBaseFormControl): template is NormalizedInputFormControl {
  return template.kind === FormControlKinds.INPUT;
}

export function NormalizeInputFormControl(
  control: InputFormControl,
): NormalizedInputFormControl {
  const type = NormalizeTypeImport(control.type);
  const validatorList = control.validatorList ?? [];
  const importList = control.importList ?? [];
  CoerceArrayItems(importList, [
    {
      name: 'MatInputModule',
      moduleSpecifier: '@angular/material/input',
    }
  ], (a, b) => a.name === b.name);
  const inputType: string = control.inputType ?? 'text';
  switch (inputType) {
    case 'checkbox':
      type.name = 'boolean';
      break;
    case 'text':
    case 'password':
    case 'color':
      type.name = 'string';
      break;
    case 'email':
      type.name = 'string';
      CoerceArrayItems(validatorList, [ 'IsEmail()' ]);
      break;
    case 'tel':
      type.name = 'string';
      CoerceArrayItems(validatorList, [ 'IsTel()' ]);
      break;
    case 'url':
      type.name = 'string';
      CoerceArrayItems(validatorList, [ 'IsUrl()' ]);
      break;
    case 'number':
      type.name = 'number';
      break;
    case 'date':
    case 'time':
    case 'datetime-local':
      type.name = 'Date';
      CoerceArrayItems(validatorList, [ 'IsDate()' ]);
      break;
    case 'file':
    case 'hidden':
    case 'image':
    case 'month':
    case 'radio':
    case 'reset':
    case 'button':
    case 'search':
    case 'submit':
    case 'week':
    case 'range':
      throw new Error(`The input type "${ inputType }" is not yet supported`);
  }
  // TODO : auto add validators
  return Object.freeze({
    ...NormalizeFormFieldFormControl(control, importList, validatorList, type, false),
    validatorList,
    kind: FormControlKinds.INPUT,
    inputType,
    placeholder: control.placeholder ?? null,
  });
}
