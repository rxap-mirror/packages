import {assertString} from './util/assertString';

const octal = /^(0o)?[0-7]+$/i;

export function isOctal(str: unknown) {
  assertString(str);
  return octal.test(str);
}
