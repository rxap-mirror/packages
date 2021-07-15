import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { isEnum } from 'class-validator';

export function IsEnum({ message, entity }: { message?: string, entity: any }) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isEnum(control.value, entity)) {
      return {
        isNumber: {
          expected: 'A enum value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
