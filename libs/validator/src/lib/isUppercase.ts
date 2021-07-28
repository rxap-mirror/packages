import { assertString } from './util/assertString';

export function isUppercase(str) {
  assertString(str);
  return str === str.toUpperCase();
}
