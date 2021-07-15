import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { isNumber } from 'class-validator';
import { IsNumberOptions } from 'class-validator/types/decorator/typechecker/IsNumber';

/**
 * @deprecated use RxapValidators.isNumber() instead
 * @param control
 * @constructor
 */
export function IsNumber(control: AbstractControl): ValidationErrors | null {
  if (control.value === null) {
    return null;
  }
  if (isNaN(Number(control.value))) {
    return { isNumber: { expected: 'A number or a string representing a number', actual: control.value } };
  }
  return null;
}

export function _IsNumber({ message, options }: { message?: string, options?: IsNumberOptions } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isNumber(control.value, options)) {
      return {
        isNumber: {
          expected: 'A number value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
