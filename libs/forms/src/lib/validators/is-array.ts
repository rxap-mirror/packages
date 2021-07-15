import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { isArray } from 'class-validator';

export function IsArray({ message }: { message?: string }) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isArray(control.value)) {
      return {
        isNumber: {
          expected: 'A array value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
