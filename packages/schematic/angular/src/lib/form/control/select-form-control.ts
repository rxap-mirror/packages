import { NormalizeTypeImportList } from '@rxap/ts-morph';
import {
  ControlOption,
  Normalized,
} from '@rxap/utilities';
import { BackendTypes } from '../../backend-types';
import {
  BaseFormControl,
  NormalizeBaseFormControl,
  NormalizedBaseFormControl,
} from './base-form-control';

import { FormControlKinds } from './form-control-kind';
import {
  FormField,
  FormFieldFormControl,
  NormalizedFormFieldFormControl,
  NormalizeFormField,
} from './form-field-form-control';

export interface SelectFormControl extends BaseFormControl, FormFieldFormControl {
  options?: ControlOption[];
  backend?: BackendTypes;
  multiple?: boolean;
  formField?: FormField;
}

export interface NormalizedSelectFormControl
  extends Readonly<Normalized<Omit<SelectFormControl, 'options' | 'type' | 'importList' | 'formField'>>>,
          NormalizedBaseFormControl, NormalizedFormFieldFormControl {
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
  const formField = NormalizeFormField(control.formField ?? {}, importList, { label: control.label });
  return Object.freeze({
    ...NormalizeBaseFormControl(control),
    importList: NormalizeTypeImportList(importList),
    kind: FormControlKinds.SELECT,
    formField,
    options: control.options && control.options.length ? Object.freeze(control.options) : null,
    backend: control.backend ?? BackendTypes.NONE,
    multiple: control.multiple ?? false,
  });
}
