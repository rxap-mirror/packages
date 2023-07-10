import {
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import {IsString} from './is-string';
import {isNumber} from './is-number';

export interface ComplexityOptions {
  uppercase?: number;
  special?: number;
  digit?: number;
  lowercase?: number;
  upperLower?: number;
  alphaNumeric?: number;
  min?: number,
  max?: number,
  range?: number,
  exact?: number,
}

interface RegexOptions {
  uppercase: string;
  special: string;
  digit: string;
  lowercase: string;
  upperLower: string;
  alphaNumeric: string;
}

const regexOptions: RegexOptions = {
  uppercase: '.*[A-Z]',
  special: '.*[^A-Za-z0-9]',
  digit: '.*[0-9]',
  lowercase: '.*[a-z]',
  upperLower: '.*[a-zA-Z]',
  alphaNumeric: '.*[a-zA-Z0-9]',
};

interface LengthOptions {
  min: string,
  max: string,
  range: string,
  exact: string,
  no_limit: string;
}

const lengthOptions: LengthOptions = {
  min: '.{n,}',
  max: '.{0,n}',
  range: '.{min,max}',
  exact: '.{n}',
  no_limit: '.*',
};

type Discriminate<U, K extends PropertyKey> =
  U extends any
    ? K extends keyof U ? U : U & Record<K, unknown>
    : never;

function inOperator<K extends PropertyKey, T extends object>(k: K, o: T): o is Discriminate<T, K> {
  return k in o;
}

function create(options: ComplexityOptions): string {
  let regex = '^';
  for (const [key, value] of Object.entries(regexOptions)) {
    if (inOperator(key, options) && isNumber(options[key])) {
      regex += '(?=' + value.repeat(options[key]) + ')';
    }
  }
  if (isNumber(options.min) && isNumber(options.max)) {
    regex += lengthOptions.range.replace('min', options.min.toFixed(0)).replace('max', options.max.toFixed(0));
  } else if (isNumber(options.max)) {
    regex += lengthOptions.max.replace('n', options.max.toFixed(0));
  } else if (isNumber(options.min)) {
    regex += lengthOptions.min.replace('n', options.min.toFixed(0));
  } else if (isNumber(options.exact)) {
    regex += lengthOptions.exact.replace('n', options.exact.toFixed(0));
  } else {
    regex += lengthOptions.no_limit;
  }
  regex += '$';
  return regex;
}

function check(str: string, regexStringOrOptions: string | ComplexityOptions) {
  let regexString: string;
  if (typeof regexStringOrOptions === 'object') {
    regexString = create(regexStringOrOptions);
  } else {
    regexString = regexStringOrOptions;
  }
  return new RegExp(regexString).test(str);
}

function checkError(str: string, options: ComplexityOptions) {
  const returnObject: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(options)) {
    returnObject[key] = check(str, {[key]: value});
  }
  return returnObject;
}

export function IsComplex({message, options}: { message?: string, options: ComplexityOptions }) {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value === null) {
      return null;
    }
    const isNotString = IsString({message})(control);
    if (isNotString !== null) {
      return isNotString;
    }
    const errors = checkError(control.value, options);
    if (Object.keys(errors).length && Object.values(errors).some(item => !item)) {
      return {
        isComplex: {
          expected: options,
          actual: errors,
          message,
        },
      };
    }
    return null;
  };
}
