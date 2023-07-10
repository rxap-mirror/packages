import {assertString} from './util/assertString';

const base32 = /^[A-Z2-7]+=*$/;

export function isBase32(str: unknown) {
  assertString(str);
  const len = str.length;
  if (len % 8 === 0 && base32.test(str)) {
    return true;
  }
  return false;
}
