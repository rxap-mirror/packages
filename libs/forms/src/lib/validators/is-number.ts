import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

export function IsNumber(control: AbstractControl): ValidationErrors | null {
  if (control.value === null) {
    return null;
  }
  if (isNaN(Number(control.value))) {
    return { isNumber: { expected: 'A number or a string representing a number', actual: control.value } };
  }
  return null;
}
