import {assertString} from './util/assertString';
import {alphanumeric} from './alpha';

export function isAlphanumeric(_str: unknown, locale = 'en-US', options: Record<string, unknown> = {}) {
  assertString(_str);

  let str = _str;
  const {ignore} = options;

  if (ignore) {
    if (ignore instanceof RegExp) {
      str = str.replace(ignore, '');
    } else if (typeof ignore === 'string') {
      str = str.replace(new RegExp(`[${ignore.replace(/[-[\]{}()*+?.,\\^$|#\\s]/g, '\\$&')}]`, 'g'), ''); // escape regex for ignore
    } else {
      throw new Error('ignore should be instance of a String or RegExp');
    }
  }

  if (locale in alphanumeric) {
    return alphanumeric[locale].test(str);
  }
  throw new Error(`Invalid locale '${locale}'`);
}

export const isAlphanumericLocales = Object.keys(alphanumeric);
