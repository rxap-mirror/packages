import { Normalized } from '@rxap/utilities';
import {
  BaseFormControl,
  NormalizeBaseFormControl,
  NormalizedBaseFormControl,
} from './base-form-control';

import { FormControlKinds } from './form-control-kind';

export interface CheckboxFormControl extends BaseFormControl {
  labelPosition?: 'before' | 'after';
}

export interface NormalizedCheckboxFormControl
  extends Readonly<Normalized<Omit<CheckboxFormControl, 'type' | 'importList' | 'role'>>>, NormalizedBaseFormControl {
  kind: FormControlKinds.CHECKBOX;
}

export function IsNormalizedCheckboxFormControl(template: NormalizedBaseFormControl): template is NormalizedCheckboxFormControl {
  return template.kind === FormControlKinds.CHECKBOX;
}

export function NormalizeCheckboxFormControl(
  control: CheckboxFormControl,
): NormalizedCheckboxFormControl {
  const importList = control.importList ?? [];
  importList.push({
    name: 'MatCheckboxModule',
    moduleSpecifier: '@angular/material/checkbox',
  });
  return Object.freeze({
    ...NormalizeBaseFormControl(control, importList, undefined,'boolean', false),
    kind: FormControlKinds.CHECKBOX,
    labelPosition: control.labelPosition ?? 'after',
  });
}
