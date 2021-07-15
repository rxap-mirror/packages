import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { isInt } from 'class-validator';

export function IsInt({ message }: { message?: string } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isInt(control.value)) {
      return {
        isNumber: {
          expected: 'A int value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
