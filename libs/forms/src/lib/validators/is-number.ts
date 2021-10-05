import {
  AbstractControl,
  ValidationErrors
} from '@angular/forms';

/**
 * Options to be passed to IsNumber decorator.
 */
export interface IsNumberOptions {
  allowNaN?: boolean;
  allowInfinity?: boolean;
  maxDecimalPlaces?: number;
  strict?: boolean;
}

/**
 * Checks if a given value is a number.
 */
export function isNumber(value: unknown, options: IsNumberOptions = {}): value is number {
  if (typeof value !== 'number') {
    return false;
  }

  if (value === Infinity || value === -Infinity) {
    return options.allowInfinity ?? false;
  }

  if (Number.isNaN(value)) {
    return options.allowNaN ?? false;
  }

  if (options.maxDecimalPlaces !== undefined) {
    let decimalPlaces = 0;
    if (value % 1 !== 0) {
      decimalPlaces = value.toString().split('.')[ 1 ].length;
    }
    if (decimalPlaces > options.maxDecimalPlaces) {
      return false;
    }
  }

  return Number.isFinite(value);
}

/**
 * @deprecated use RxapValidators.isNumber() instead
 * @param control
 * @constructor
 */
export function IsNumber(control: AbstractControl): ValidationErrors | null {
  if (control.value === null) {
    return null;
  }
  if (isNaN(Number(control.value))) {
    return { isNumber: { expected: 'A number or a string representing a number', actual: control.value } };
  }
  return null;
}

export function _IsNumber({ message, options }: { message?: string, options?: IsNumberOptions } = {}) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    if (!isNumber(!options?.strict && typeof control.value === 'string' ? Number(control.value) : control.value, options)) {
      return {
        isNumber: {
          expected: 'A number value',
          actual:   control.value,
          message
        }
      };
    }
    return null;
  };
}
