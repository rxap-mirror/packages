import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  isNumber,
  IsNumberOptions,
} from './is-number';

export function IsInt({
                        message,
                        options,
                      }: { message?: string, options?: IsNumberOptions } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isNumber(control.value, options) || Number.isInteger(control.value)) {
      return {
        isInt: {
          expected: 'A int value',
          actual: control.value,
          message,
        },
      };
    }
    return null;
  };
}
