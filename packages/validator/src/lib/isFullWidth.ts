import { assertString } from './util/assertString';

export const fullWidth = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;

export function isFullWidth(str: unknown) {
  assertString(str);
  return fullWidth.test(str);
}
