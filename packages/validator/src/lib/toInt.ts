import { assertString } from './util/assertString';

export function toInt(str: unknown, radix?: number): number {
  assertString(str);
  return parseInt(str, radix || 10);
}
