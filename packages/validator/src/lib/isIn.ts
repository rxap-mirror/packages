import { assertString } from './util/assertString';
import { toString } from './util/toString';

export interface IsInOptions {
  indexOf?: (str: string) => number;
}

export function isIn(str: unknown, options?: IsInOptions | IsInOptions[]) {
  assertString(str);
  let i;
  if (Array.isArray(options)) {
    const array: string[] = [];
    for (i in options) {
      // https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md#ignoring-code-for-coverage-purposes
      // istanbul ignore else
      if ({}.hasOwnProperty.call(options, i)) {
        array[i] = toString(options[i]);
      }
    }
    return array.indexOf(str) >= 0;
  } else if (typeof options === 'object') {
    return options.hasOwnProperty(str);
  }
  return false;
}
