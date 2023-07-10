import {assertString} from './util/assertString';

const md5 = /^[a-f0-9]{32}$/;

export function isMD5(str: unknown) {
  assertString(str);
  return md5.test(str);
}
