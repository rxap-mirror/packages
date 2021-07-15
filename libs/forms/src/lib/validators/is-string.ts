import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { isString } from 'class-validator';

export function IsString({ message }: { message?: string } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isString(control.value)) {
      return {
        isString: {
          expected: 'A string value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
