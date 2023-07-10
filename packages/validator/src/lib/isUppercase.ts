import { assertString } from './util/assertString';

export function isUppercase(str: unknown) {
  assertString(str);
  return str === str.toUpperCase();
}
