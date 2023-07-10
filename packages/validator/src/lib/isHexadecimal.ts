import {assertString} from './util/assertString';

const hexadecimal = /^(0x|0h)?[0-9A-F]+$/i;

export function isHexadecimal(str: unknown) {
  assertString(str);
  return hexadecimal.test(str);
}
