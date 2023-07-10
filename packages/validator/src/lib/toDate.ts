import { assertString } from './util/assertString';

export function toDate(date: unknown) {
  assertString(date);
  const value = Date.parse(date);
  return !isNaN(value) ? new Date(value) : null;
}
