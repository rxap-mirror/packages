import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

export function IsEnum({
                         message,
                         entity,
                       }: { message?: string, entity: any }) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (Object.keys(entity).map(k => entity[k]).indexOf(control.value) === -1) {
      return {
        isEnum: {
          expected: 'A enum value',
          actual: control.value,
          message,
        },
      };
    }
    return null;
  };
}
