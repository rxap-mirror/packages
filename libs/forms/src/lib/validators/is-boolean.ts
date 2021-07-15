import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { isBoolean } from 'class-validator';

export function IsBoolean({ message }: { message?: string }) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isBoolean(control.value)) {
      return {
        isNumber: {
          expected: 'A boolean value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
