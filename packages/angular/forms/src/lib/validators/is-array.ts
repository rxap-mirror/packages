import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

export function IsArray({ message }: { message?: string } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!Array.isArray(control.value)) {
      return {
        isArray: {
          expected: 'A array value',
          actual: control.value,
          message,
        },
      };
    }
    return null;
  };
}
