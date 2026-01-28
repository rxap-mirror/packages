import { BackendOptions } from '../../backend/backend-options';
import { AbstractControlRolls } from '../abstract-control';
import {
  Control,
  NormalizedControl,
} from '../control';
import { NormalizeAutocompleteFormControl } from './autocomplete-form-control';
import { NormalizeAutocompleteTableSelectFormControl } from './autocomplete-table-select-form-control';
import {
  BaseFormControl,
  NormalizeBaseFormControl,
  NormalizedBaseFormControl,
} from './base-form-control';
import {
  CheckboxFormControl,
  NormalizeCheckboxFormControl,
  NormalizedCheckboxFormControl,
} from './checkbox-form-control';
import { NormalizeDateFormControl } from './date-form-control';
import { FormControlKinds } from './form-control-kind';
import {
  FormFieldFormControl,
  NormalizedFormFieldFormControl,
} from './form-field-form-control';
import {
  InputFormControl,
  NormalizedInputFormControl,
  NormalizeInputFormControl,
} from './input-form-control';
import {
  NormalizedSelectFormControl,
  NormalizeSelectFormControl,
  SelectFormControl,
} from './select-form-control';
import {
  NormalizedSlideToggleFormControl,
  NormalizeSlideToggleFormControl,
  SlideToggleFormControl,
} from './slide-toggle-form-control';
import {
  NormalizedTableSelectFormControl,
  NormalizeTableSelectFormControl,
  TableSelectFormControl,
} from './table-select-form-control';
import { NormalizeTextareaFormControl } from './textarea-form-control';

export type FormControl = { role: AbstractControlRolls.CONTROL } & (BaseFormControl | CheckboxFormControl | FormFieldFormControl | InputFormControl | SelectFormControl | SlideToggleFormControl | TableSelectFormControl);

export type NormalizedFormControl = { role: AbstractControlRolls.CONTROL, kind: FormControlKinds } & (NormalizedBaseFormControl | NormalizedCheckboxFormControl | NormalizedFormFieldFormControl | NormalizedInputFormControl | NormalizedSelectFormControl | NormalizedSlideToggleFormControl | NormalizedTableSelectFormControl);

export function IsFormControl(control: Control): control is FormControl {
  return control.role === AbstractControlRolls.CONTROL;
}

export function IsNormalizedFormControl(control: NormalizedControl): control is NormalizedFormControl {
  return control.role === AbstractControlRolls.CONTROL;
}

export function NormalizeFormControl(control: FormControl, backend: BackendOptions): NormalizedFormControl {
  const kind = control.kind ?? FormControlKinds.DEFAULT;
  switch (kind) {
    case FormControlKinds.INPUT:
      return NormalizeInputFormControl(control, backend);
    case FormControlKinds.SELECT:
      return NormalizeSelectFormControl(control, backend);
    case FormControlKinds.CHECKBOX:
      return NormalizeCheckboxFormControl(control, backend);
    case FormControlKinds.SLIDE_TOGGLE:
      return NormalizeSlideToggleFormControl(control, backend);
    case FormControlKinds.TABLE_SELECT:
      return NormalizeTableSelectFormControl(control, backend);
    case FormControlKinds.AUTOCOMPLETE_TABLE_SELECT:
      return NormalizeAutocompleteTableSelectFormControl(control, backend);
    case FormControlKinds.TEXTAREA:
      return NormalizeTextareaFormControl(control, backend);
    case FormControlKinds.AUTOCOMPLETE:
      return NormalizeAutocompleteFormControl(control, backend);
    case FormControlKinds.DATE:
      return NormalizeDateFormControl(control, backend);
    case FormControlKinds.DEFAULT:
    default:
      return NormalizeBaseFormControl(control, undefined, undefined, undefined, undefined, backend);
  }
}

export function NormalizeFormControlList(controls: ReadonlyArray<FormControl> = [], backend: BackendOptions): ReadonlyArray<NormalizedFormControl> {
  return controls?.map(control => NormalizeFormControl(control, backend)) ?? [];
}
