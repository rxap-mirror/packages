import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { isUUID } from '@rxap/validator';

export function IsUUID({message, version = 'all'}: { message?: string, version?: string } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!(typeof control.value === 'string' && isUUID(control.value, version))) {
      return {
        isUuid: {
          expected: version === 'all' ? `A valid uuid` : `A valid uuid version ${version}`,
          actual: control.value,
          message,
        },
      };
    }
    return null;
  };
}
