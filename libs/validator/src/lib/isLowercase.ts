import { assertString } from './util/assertString';

export function isLowercase(str) {
  assertString(str);
  return str === str.toLowerCase();
}
