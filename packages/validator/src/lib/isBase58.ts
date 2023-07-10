import { assertString } from './util/assertString';

// Accepted chars - 123456789ABCDEFGH JKLMN PQRSTUVWXYZabcdefghijk mnopqrstuvwxyz
const base58Reg = /^[A-HJ-NP-Za-km-z1-9]*$/;

export function isBase58(str: unknown) {
  assertString(str);
  if (base58Reg.test(str)) {
    return true;
  }
  return false;
}
