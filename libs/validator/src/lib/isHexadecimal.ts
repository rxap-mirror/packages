import { assertString } from './util/assertString';

const hexadecimal = /^(0x|0h)?[0-9A-F]+$/i;

export function isHexadecimal(str) {
  assertString(str);
  return hexadecimal.test(str);
}
