import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

export function IsString({ message }: { message?: string } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!(control.value instanceof String || typeof control.value === 'string')) {
      return {
        isString: {
          expected: 'A string value',
          actual: control.value,
          message,
        },
      };
    }
    return null;
  };
}
