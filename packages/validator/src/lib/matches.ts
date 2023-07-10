import {assertString} from './util/assertString';

export function matches(str: unknown, patternOrString: RegExp | string, modifiers?: string) {
  assertString(str);
  let pattern: RegExp;
  if (typeof patternOrString === 'string') {
    pattern = new RegExp(patternOrString, modifiers);
  } else {
    pattern = patternOrString;
  }
  return pattern.test(str);
}
