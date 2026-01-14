import {
  AbstractControl,
  AbstractControlRolls,
  NormalizedAbstractControl,
} from './abstract-control';
import {
  IsFormArray,
  NormalizeFormArray,
} from './array/form-array';
import {
  FormControl,
  IsFormControl,
  NormalizedFormControl,
  NormalizeFormControl,
} from './control/form-control';
import {
  IsFormGroup,
  NormalizeFormGroup,
} from './group/form-group';

export type Control = AbstractControl | FormControl;

export type NormalizedControl = NormalizedAbstractControl | NormalizedFormControl;

export function NormalizeControl(control: Control): NormalizedControl {
  control.role ??= AbstractControlRolls.CONTROL;
  if (IsFormControl(control)) {
    return NormalizeFormControl(control);
  }
  if (IsFormGroup(control)) {
    return NormalizeFormGroup(control);
  }
  if (IsFormArray(control)) {
    return NormalizeFormArray(control);
  }
  throw new Error(`Unknown control role: '${control.role}'`);
}

export function NormalizeControlList(controlList?: Control[]): NormalizedControl[] {
  return controlList?.map(NormalizeControl) ?? [];
}

