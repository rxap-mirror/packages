import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  isEmail,
  IsEmailOptions,
} from '@rxap/validator';

export function IsEmail({message, options}: { message?: string, options?: IsEmailOptions } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!(typeof control.value === 'string' && isEmail(control.value, options))) {
      return {
        isEmail: {
          expected: 'A email value',
          actual: control.value,
          message,
        },
      };
    }
    return null;
  };
}
