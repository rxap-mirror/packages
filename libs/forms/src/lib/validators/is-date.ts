import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { isDate } from 'class-validator';

export function IsDate({ message }: { message?: string } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isDate(control.value)) {
      return {
        isDate: {
          expected: 'A date value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
