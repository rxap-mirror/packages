import {
  ControlOption,
  Normalized,
} from '@rxap/utilities';
import { BackendTypes } from '../../backend-types';
import { NormalizedBaseFormControl } from './base-form-control';

import { FormControlKinds } from './form-control-kind';
import {
  FormField,
  FormFieldFormControl,
  NormalizedFormFieldFormControl,
  NormalizeFormFieldFormControl,
} from './form-field-form-control';

export interface SelectFormControl extends FormFieldFormControl {
  options?: ControlOption[];
  backend?: BackendTypes;
  multiple?: boolean;
  formField?: FormField;
}

export interface NormalizedSelectFormControl
  extends Readonly<Normalized<Omit<SelectFormControl, 'options' | 'type' | 'importList' | 'formField' | 'role'>>>,
          NormalizedFormFieldFormControl {
  kind: FormControlKinds.SELECT;
  options: ReadonlyArray<ControlOption> | null;
  backend: BackendTypes;
}

export function IsNormalizedSelectFormControl(template: NormalizedBaseFormControl): template is NormalizedSelectFormControl {
  return template.kind === FormControlKinds.SELECT;
}

export function NormalizeSelectFormControl(
  control: SelectFormControl,
): NormalizedSelectFormControl {
  const importList = control.importList ?? [];
  importList.push({
    name: 'MatSelectModule',
    moduleSpecifier: '@angular/material/select',
  });
  const multiple = control.multiple ?? false;
  return Object.freeze({
    ...NormalizeFormFieldFormControl(control, importList, undefined, undefined, multiple),
    kind: FormControlKinds.SELECT,
    options: control.options && control.options.length ? Object.freeze(control.options) : null,
    backend: control.backend ?? BackendTypes.NONE,
    multiple,
  });
}
