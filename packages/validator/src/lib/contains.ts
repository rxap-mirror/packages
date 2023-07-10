import {assertString} from './util/assertString';
import {toString} from './util/toString';
import {merge} from './util/merge';

export interface ContainsOptions {
  ignoreCase?: boolean;
}

const defaulContainsOptions: ContainsOptions = {
  ignoreCase: false,
};

export function contains(str: unknown, elem: unknown, options: ContainsOptions = {}) {
  assertString(str);
  options = merge(options, defaulContainsOptions);
  return options.ignoreCase ?
    str.toLowerCase().indexOf(toString(elem).toLowerCase()) >= 0 :
    str.indexOf(toString(elem)) >= 0;
}
