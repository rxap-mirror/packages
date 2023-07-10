import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {isPort} from '@rxap/validator';

export function IsPort({message}: { message?: string } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!(typeof control.value === 'string' && isPort(control.value))) {
      return {
        isPort: {
          expected: `A valid port number between 1 and 65535`,
          actual: control.value,
          message,
        },
      };
    }
    return null;
  };
}
