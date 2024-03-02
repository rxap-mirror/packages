import { DtoClassProperty } from '@rxap/schematics-ts-morph';
import {
  AbstractControl,
  AbstractControlRolls,
  NormalizeAbstractControl,
  NormalizedAbstractControl,
} from './abstract-control';
import {
  FormControl,
  IsFormControl,
  NormalizedFormControl,
  NormalizeFormControl,
} from './control/form-control';

export type Control = AbstractControl | FormControl;

export type NormalizedControl = NormalizedAbstractControl | NormalizedFormControl;

export function NormalizeControl(control: Control): NormalizedControl {
  const role = control.role ?? AbstractControlRolls.CONTROL;
  if (IsFormControl(control)) {
    return NormalizeFormControl(control);
  }
  return NormalizeAbstractControl(control, role, []);
}

export function NormalizeControlList(controlList?: Control[]): NormalizedControl[] {
  return controlList?.map(NormalizeControl) ?? [];
}

export function ControlToDtoClassProperty(
  control: NormalizedControl,
): DtoClassProperty {
  return {
    name: control.name,
    type: control.type,
    isOptional: !control.isRequired,
    isArray: control.isArray,
    source: control.source,
  };
}
