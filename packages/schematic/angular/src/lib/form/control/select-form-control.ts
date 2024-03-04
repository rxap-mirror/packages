import {
  CoerceArrayItems,
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
  optionList?: ControlOption[];
  backend?: BackendTypes;
  multiple?: boolean;
  formField?: FormField;
}

export interface NormalizedSelectFormControl
  extends Readonly<Normalized<Omit<SelectFormControl, 'optionList' | 'type' | 'importList' | 'formField' | 'role'>>>,
          NormalizedFormFieldFormControl {
  kind: FormControlKinds.SELECT;
  optionList: ReadonlyArray<ControlOption> | null;
  backend: BackendTypes;
}

export function IsNormalizedSelectFormControl(template: NormalizedBaseFormControl): template is NormalizedSelectFormControl {
  return template.kind === FormControlKinds.SELECT;
}

export function NormalizeSelectFormControl(
  control: SelectFormControl,
): NormalizedSelectFormControl {
  const importList = control.importList ?? [];
  CoerceArrayItems(importList, [
    {
      name: 'MatSelectModule',
      moduleSpecifier: '@angular/material/select',
    },
    {
      name: 'InputSelectOptionsDirective',
      moduleSpecifier: '@rxap/form-system',
    }
  ], (a, b) => a.name === b.name);
  const multiple = control.multiple ?? false;
  return Object.freeze({
    ...NormalizeFormFieldFormControl(control, importList, undefined, undefined, multiple),
    kind: FormControlKinds.SELECT,
    optionList: control.optionList && control.optionList.length ? Object.freeze(control.optionList) : null,
    backend: control.backend ?? BackendTypes.NONE,
    multiple,
  });
}
