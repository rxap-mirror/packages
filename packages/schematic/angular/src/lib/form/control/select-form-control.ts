import {
  NormalizedUpstreamOptions,
  NormalizeUpstreamOptions,
  UpstreamOptions,
} from '@rxap/ts-morph';
import {
  CoerceArrayItems,
  ControlOption,
  Normalized,
} from '@rxap/utilities';
import { BackendTypes } from '../../backend/backend-types';
import {
  BackendOptions,
  NormalizeBackendOptions,
  NormalizedBackendOptions,
} from '../../backend/backend-options';
import {
  DataSourceOptions,
  NormalizeDataSourceOptions,
  NormalizedDataSourceOptions,
} from '../../data-source/data-source-options';
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
  backend?: BackendTypes | BackendOptions;
  multiple?: boolean;
  formField?: FormField;
  upstream?: UpstreamOptions;
  dataSource?: DataSourceOptions;
}

export interface NormalizedSelectFormControl
  extends Readonly<Normalized<Omit<SelectFormControl, keyof NormalizedFormFieldFormControl | 'optionList' | 'backend'>>>,
          NormalizedFormFieldFormControl {
  kind: FormControlKinds.SELECT;
  optionList: ReadonlyArray<ControlOption> | null;
  backend: NormalizedBackendOptions;
  upstream: NormalizedUpstreamOptions | null;
  dataSource: NormalizedDataSourceOptions | null;
}

export function IsSelectFormControl(template: FormFieldFormControl): template is SelectFormControl {
  return template.kind === FormControlKinds.SELECT;
}

export function IsNormalizedSelectFormControl(template: NormalizedBaseFormControl): template is NormalizedSelectFormControl {
  return template.kind === FormControlKinds.SELECT;
}

export function NormalizeSelectFormControl(
  control: SelectFormControl,
  backend: BackendOptions,
): NormalizedSelectFormControl {
  const importList = control.importList ?? [];
  CoerceArrayItems(importList, [
    {
      name: 'MatSelectModule',
      moduleSpecifier: '@angular/material/select',
    },
  ], (a, b) => a.name === b.name);
  const optionList = control.optionList && control.optionList.length ? Object.freeze(control.optionList) : null;
  if (optionList) {
    CoerceArrayItems(importList, [
      {
        name: 'InputSelectOptionsDirective',
        moduleSpecifier: '@rxap/form-system',
      }
    ], (a, b) => a.name === b.name);
  } else {
    CoerceArrayItems(importList, [
      {
        name: 'OptionsFromMethodDirective',
        moduleSpecifier: '@rxap/form-system',
      }
    ], (a, b) => a.name === b.name);
  }
  const multiple = control.multiple ?? false;
  return Object.freeze({
    ...NormalizeFormFieldFormControl(control, importList, undefined, undefined, multiple, undefined, backend),
    dataSource: NormalizeDataSourceOptions(control.dataSource),
    kind: FormControlKinds.SELECT,
    optionList,
    backend: NormalizeBackendOptions(control.backend ?? BackendTypes.NONE),
    multiple,
    upstream: NormalizeUpstreamOptions(control.upstream),
  });
}
