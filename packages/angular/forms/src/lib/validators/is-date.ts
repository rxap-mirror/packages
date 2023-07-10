import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

export function IsDate({ message }: { message?: string } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!(control.value instanceof Date && !isNaN(control.value.getTime()))) {
      return {
        isDate: {
          expected: 'A date value',
          actual: control.value,
          message,
        },
      };
    }
    return null;
  };
}
