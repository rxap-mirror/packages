import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { isObject } from 'class-validator';

export function IsObject({ message }: { message?: string } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isObject(control.value)) {
      return {
        isNumber: {
          expected: 'A object value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
