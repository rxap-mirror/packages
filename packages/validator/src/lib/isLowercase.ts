import { assertString } from './util/assertString';

export function isLowercase(str: unknown) {
  assertString(str);
  return str === str.toLowerCase();
}
