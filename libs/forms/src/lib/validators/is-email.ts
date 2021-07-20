import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import isEmailValidator from 'validator/es/lib/isEmail';
import type ValidatorJS from 'validator';

export type IsEmailOptions = ValidatorJS.IsEmailOptions

export function IsEmail({ message, options }: { message?: string, options?: ValidatorJS.IsEmailOptions } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!(typeof control.value === 'string' && isEmailValidator(control.value, options))) {
      return {
        isEmail: {
          expected: 'A email value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
