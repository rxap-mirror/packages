import { assertString } from './util/assertString';

const eth = /^(0x)[0-9a-f]{40}$/i;

export function isEthereumAddress(str: unknown) {
  assertString(str);
  return eth.test(str);
}
