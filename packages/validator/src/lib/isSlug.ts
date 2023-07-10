import {assertString} from './util/assertString';

const charsetRegex = /^[^\s-_](?!.*?[-_]{2,})[a-z0-9-\\][^\s]*[^-_\s]$/;

export function isSlug(str: unknown) {
  assertString(str);
  return (charsetRegex.test(str));
}
