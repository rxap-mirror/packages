import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import isUrlValidator from 'validator/es/lib/isURL';
import type ValidatorJS from 'validator';

export type IsURLOptions = ValidatorJS.IsURLOptions;

export function IsUrl({ message, options }: { message?: string, options?: ValidatorJS.IsURLOptions } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!(typeof control.value === 'string' && isUrlValidator(control.value, options))) {
      return {
        isURL: {
          expected: 'A url value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
