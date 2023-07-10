import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {
  isMobilePhone,
  IsMobilePhoneOptions,
  MobilePhoneLocale,
} from '@rxap/validator';

export function IsPhoneNumber({message, locale, options}: {
  message?: string,
  locale?: 'any' | MobilePhoneLocale | MobilePhoneLocale[],
  options?: IsMobilePhoneOptions,
} = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isMobilePhone(control.value, locale, options)) {
      return {
        isPhoneNumber: {
          expected: 'A phone number value',
          actual: control.value,
          message,
        },
      };
    }
    return null;
  };
}
