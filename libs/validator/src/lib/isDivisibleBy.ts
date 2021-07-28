import { assertString } from './util/assertString';
import { toFloat } from './toFloat';

export function isDivisibleBy(str, num) {
  assertString(str);
  return toFloat(str) % parseInt(num, 10) === 0;
}
