import { BackendOptions } from '../../backend/backend-options';
import { AbstractControlRolls } from '../abstract-control';
import {
  Control,
  NormalizedControl,
} from '../control';
import {
  BaseFormGroup,
  NormalizeBaseFormGroup,
  NormalizedBaseFormGroup,
} from './base-form-group';

export type FormGroup = { role: AbstractControlRolls.GROUP } & (BaseFormGroup);

export type NormalizedFormGroup = { role: AbstractControlRolls.GROUP } & (NormalizedBaseFormGroup);

export function NormalizeFormGroup(
  group: FormGroup,
  backend: BackendOptions,
): NormalizedFormGroup {
  return NormalizeBaseFormGroup(group, undefined, undefined, undefined, undefined, backend);
}

export function IsFormGroup(control: Control): control is FormGroup {
  return control.role === AbstractControlRolls.GROUP;
}

export function IsNormalizedFormGroup(control: NormalizedControl): control is NormalizedFormGroup {
  return control.role === AbstractControlRolls.GROUP;
}
