import { assertString } from './util/assertString';

export function unescape(str: unknown) {
  assertString(str);
  return (str.replace(/&amp;/g, '&')
             .replace(/&quot;/g, '"')
             .replace(/&#x27;/g, '\'')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&#x2F;/g, '/')
             .replace(/&#x5C;/g, '\\')
             .replace(/&#96;/g, '`'));
}
