import { assertString } from './util/assertString';
import { merge } from './util/merge';

export interface IsJSONOptions {
  allow_primitives?: boolean;
}

const default_json_options: IsJSONOptions = {
  allow_primitives: false,
};

export function isJSON(str: unknown, options: IsJSONOptions = {}) {
  assertString(str);
  try {
    options = merge(options, default_json_options);
    let primitives: Array<null | boolean> = [];
    if (options.allow_primitives) {
      primitives = [ null, false, true ];
    }

    const obj = JSON.parse(str);
    return primitives.includes(obj) || (!!obj && typeof obj === 'object');
  } catch (e: any) { /* ignore */
  }
  return false;
}
