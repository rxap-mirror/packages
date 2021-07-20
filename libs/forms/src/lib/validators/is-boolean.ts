import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

export function IsBoolean({ message }: { message?: string } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!(control.value instanceof Boolean || typeof control.value === 'boolean')) {
      return {
        isBoolean: {
          expected: 'A boolean value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
