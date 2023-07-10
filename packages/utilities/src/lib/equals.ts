function _arrayFromIterator(iter: Iterator<any>) {
  const list: any[] = [];
  let next;
  while (!(next = iter.next()).done) {
    list.push(next.value);
  }
  return list;
}

function _includesWith(
  pred: (x: any, listIdx: any) => boolean,
  x: any,
  list: any[],
) {
  let idx = 0;
  const len = list.length;

  while (idx < len) {
    if (pred(x, list[idx])) {
      return true;
    }
    idx += 1;
  }
  return false;
}

function _functionName(f: any) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  const match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
}

function _has(prop: string, obj: any) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Gives a single-word string description of the (native) type of a value,
 * returning such answers as 'Object', 'Number', 'Array', or 'Null'. Does not
 * attempt to distinguish user Object types any further, reporting them all as
 * 'Object'.
 *
 * @func
 * @memberOf R
 * @since v0.8.0
 * @category Type
 * @sig (* -> {*}) -> String
 * @param {*} val The value to test
 * @return {String}
 * @example
 *
 *      R.type({}); //=> "Object"
 *      R.type(1); //=> "Number"
 *      R.type(false); //=> "Boolean"
 *      R.type('s'); //=> "String"
 *      R.type(null); //=> "Null"
 *      R.type([]); //=> "Array"
 *      R.type(/[A-z]/); //=> "RegExp"
 *      R.type(() => {}); //=> "Function"
 *      R.type(undefined); //=> "Undefined"
 */
function type(val: any): string {
  if (val === null) {
    return 'Null';
  }
  if (val === undefined) {
    return 'Undefined';
  }
  return Object.prototype.toString.call(val).slice(8, -1);
}

/**
 * private _uniqContentEquals function.
 * That function is checking equality of 2 iterator contents with 2 assumptions
 * - iterators lengths are the same
 * - iterators values are unique
 *
 * false-positive result will be returned for comparision of, e.g.
 * - [1,2,3] and [1,2,3,4]
 * - [1,1,1] and [1,2,3]
 * */

function _uniqContentEquals(
  aIterator: any,
  bIterator: any,
  stackA: any,
  stackB: any,
): boolean {
  const a = _arrayFromIterator(aIterator);
  const b = _arrayFromIterator(bIterator);

  function eq(_a: any, _b: any) {
    return equals(_a, _b, stackA.slice(), stackB.slice());
  }

  // if *a* array contains any element that is not included in *b*
  return !_includesWith(
    function (b, aItem) {
      return !_includesWith(eq, aItem, b);
    },
    b,
    a,
  );
}

export function equals(a: any, b: any, stackA: any[] = [], stackB: any[] = []) {
  if (Object.is(a, b)) {
    return true;
  }

  const typeA = type(a);

  if (typeA !== type(b)) {
    return false;
  }

  if (
    typeof a['fantasy-land/equals'] === 'function' ||
    typeof b['fantasy-land/equals'] === 'function'
  ) {
    return (
      typeof a['fantasy-land/equals'] === 'function' &&
      a['fantasy-land/equals'](b) &&
      typeof b['fantasy-land/equals'] === 'function' &&
      b['fantasy-land/equals'](a)
    );
  }

  if (typeof a.equals === 'function' || typeof b.equals === 'function') {
    return (
      typeof a.equals === 'function' &&
      a.equals(b) &&
      typeof b.equals === 'function' &&
      b.equals(a)
    );
  }

  switch (typeA) {
    case 'Arguments':
    case 'Array':
    case 'Object':
      if (
        typeof a.constructor === 'function' &&
        _functionName(a.constructor) === 'Promise'
      ) {
        return a === b;
      }
      break;
    case 'Boolean':
    case 'Number':
    case 'String':
      if (!(typeof a === typeof b && Object.is(a.valueOf(), b.valueOf()))) {
        return false;
      }
      break;
    case 'Date':
      if (!Object.is(a.valueOf(), b.valueOf())) {
        return false;
      }
      break;
    case 'Error':
      return a.name === b.name && a.message === b.message;
    case 'RegExp':
      if (
        !(
          a.source === b.source &&
          a.global === b.global &&
          a.ignoreCase === b.ignoreCase &&
          a.multiline === b.multiline &&
          a.sticky === b.sticky &&
          a.unicode === b.unicode
        )
      ) {
        return false;
      }
      break;
  }

  let idx = stackA.length - 1;
  while (idx >= 0) {
    if (stackA[idx] === a) {
      return stackB[idx] === b;
    }
    idx -= 1;
  }

  switch (typeA) {
    case 'Map':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(
        a.entries(),
        b.entries(),
        stackA.concat([a]),
        stackB.concat([b]),
      );
    case 'Set':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(
        a.values(),
        b.values(),
        stackA.concat([a]),
        stackB.concat([b]),
      );
    case 'Arguments':
    case 'Array':
    case 'Object':
    case 'Boolean':
    case 'Number':
    case 'String':
    case 'Date':
    case 'Error':
    case 'RegExp':
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'ArrayBuffer':
      break;
    default:
      // Values of other types are only equal if identical.
      return false;
  }

  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) {
    return false;
  }

  const extendedStackA = stackA.concat([a]);
  const extendedStackB = stackB.concat([b]);

  idx = keysA.length - 1;
  while (idx >= 0) {
    const key = keysA[idx];
    if (
      !(_has(key, b) && equals(b[key], a[key], extendedStackA, extendedStackB))
    ) {
      return false;
    }
    idx -= 1;
  }
  return true;
}
