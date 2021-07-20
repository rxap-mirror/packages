import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

export function IsObject({ message }: { message?: string } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!(control.value !== undefined && (typeof control.value === 'object' || typeof control.value === 'function') && !Array.isArray(control.value))) {
      return {
        isObject: {
          expected: 'A object value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
