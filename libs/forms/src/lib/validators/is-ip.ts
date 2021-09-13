import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { isIP } from '@rxap/validator';

export function IsIP({ message, version }: { message?: string, version?: string | number } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!(typeof control.value === 'string' && isIP(control.value, version))) {
      return {
        isIp: {
          expected: `A valid IPv${version ?? '4'} value`,
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
