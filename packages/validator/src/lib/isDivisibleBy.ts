import {assertString} from './util/assertString';
import {toFloat} from './toFloat';

export function isDivisibleBy(str: unknown, num: string) {
  assertString(str);
  return toFloat(str) % parseInt(num, 10) === 0;
}
