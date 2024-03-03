import { AbstractControlRolls } from '../abstract-control';
import {
  Control,
  NormalizedControl,
} from '../control';
import {
  BaseFormArray,
  NormalizeBaseFormArray,
  NormalizedBaseFormArray,
} from './base-form-array';

export type FormArray = { role: AbstractControlRolls.ARRAY } & (BaseFormArray);

export type NormalizedFormArray = { role: AbstractControlRolls.ARRAY } & (NormalizedBaseFormArray);

export function NormalizeFormArray(
  array: FormArray
): NormalizedFormArray {
  return NormalizeBaseFormArray(array);
}

export function IsFormArray(control: Control): control is FormArray {
  return control.role === AbstractControlRolls.ARRAY;
}

export function IsNormalizedFormArray(control: NormalizedControl): control is NormalizedFormArray {
  return control.role === AbstractControlRolls.ARRAY;
}
