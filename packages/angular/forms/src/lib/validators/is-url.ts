import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  isURL,
  IsURLOptions,
} from '@rxap/validator';

export function IsUrl({message, options}: { message?: string, options?: IsURLOptions } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!(typeof control.value === 'string' && isURL(control.value, options))) {
      return {
        isURL: {
          expected: 'A url value',
          actual: control.value,
          message,
        },
      };
    }
    return null;
  };
}
