import { assertString } from './util/assertString';
import { merge } from './util/merge';

const default_json_options = {
  allow_primitives: false
};

export function isJSON(str, options) {
  assertString(str);
  try {
    options                               = merge(options, default_json_options);
    let primitives: Array<null | boolean> = [];
    if (options.allow_primitives) {
      primitives = [ null, false, true ];
    }

    const obj = JSON.parse(str);
    return primitives.includes(obj) || (!!obj && typeof obj === 'object');
  } catch (e) { /* ignore */ }
  return false;
}
