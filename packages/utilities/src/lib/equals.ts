/**
 * Converts an iterator to an array.
 *
 * This function takes an iterator as an input and iterates over it, pushing each value into an array.
 * The iteration continues until the iterator is exhausted (i.e., until the iterator's `next` method returns an object with `done` property set to `true`).
 * The function then returns the array containing all the values produced by the iterator.
 *
 * @param {Iterator<any>} iter - The iterator to be converted to an array. The iterator should implement a `next` method that returns an object with `value` and `done` properties.
 *
 * @returns {any[]} - An array containing all the values produced by the iterator. The order of the values in the array is the same as the order in which they were produced by the iterator.
 *
 * @example
 *
 * const iterator = someIterable[Symbol.iterator]();
 * const array = _arrayFromIterator(iterator);
 * // array now contains all the values produced by the iterator
 *
 * @throws {TypeError} - If the input is not an iterator (i.e., does not implement a `next` method that returns an object with `value` and `done` properties).
 */
function _arrayFromIterator(iter: Iterator<any>) {
  const list: any[] = [];
  let next;
  while (!(next = iter.next()).done) {
    list.push(next.value);
  }
  return list;
}

/**
 * The `_includesWith` function is a utility function that checks if a particular value exists in a list based on a predicate function.
 *
 * @param {Function} pred - A predicate function that takes two arguments: `x` and `listIdx`. This function should return a boolean value. It is used to determine if `x` is included in the list.
 * @param {any} x - The value to be checked for inclusion in the list. This value is passed as the first argument to the `pred` function.
 * @param {Array} list - An array of values in which to search for `x`. Each element in the list is passed as the second argument to the `pred` function.
 *
 * @returns {boolean} Returns `true` if the `pred` function returns `true` for any element in the list, otherwise returns `false`.
 *
 * @example
 * // The function can be used as follows:
 * const pred = (x, y) => x === y;
 * const x = 5;
 * const list = [1, 2, 3, 4, 5];
 * const result = _includesWith(pred, x, list); // result is true
 *
 * @note
 * The function uses a while loop to iterate over the list. The loop continues until it has checked every element in the list or until the `pred` function returns `true`.
 */
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

/**
 * This function extracts the name of a given function and returns it as a string.
 * If the function is anonymous or the name cannot be extracted, an empty string is returned.
 *
 * @param {any} f - The function whose name is to be extracted. This can be any valid JavaScript function.
 *
 * @returns {string} The name of the function passed as an argument. If the function is anonymous or the name cannot be extracted, an empty string is returned.
 *
 * @example
 * _functionName(function testFunc() {}); // Returns: "testFunc"
 * _functionName(function() {}); // Returns: ""
 *
 * @note The function uses a regular expression to match the pattern of a function declaration. It converts the function to a string and then attempts to match the pattern. If the pattern does not match, it means the function is either anonymous or not a valid function, in which case an empty string is returned.
 */
function _functionName(f: any) {
  // String(x => x) evaluates to "x => x", so the pattern may not match.
  const match = String(f).match(/^function (\w*)/);
  return match == null ? '' : match[1];
}

/**
 * Checks if the provided object has the specified property.
 *
 * @param {string} prop - The property to check for in the object.
 * @param {any} obj - The object to check within.
 *
 * @returns {boolean} Returns true if the object has the property, false otherwise.
 *
 * @example
 * // returns true
 * _has('name', { name: 'John Doe', age: 30 });
 *
 * @example
 * // returns false
 * _has('address', { name: 'John Doe', age: 30 });
 *
 * @remarks
 * This function uses the `Object.prototype.hasOwnProperty` method to check if the object has the specified property.
 * It does not check for properties in the object's prototype chain.
 */
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

/**
 * This function checks if two values are equal. It uses a deep comparison algorithm to determine if two values are equivalent in structure and value.
 *
 * @export
 * @function equals
 * @param {any} a - The first value to compare.
 * @param {any} b - The second value to compare.
 * @param {any[]} [stackA=[]] - An optional array to keep track of traversed values in the first argument. This is used to handle circular references.
 * @param {any[]} [stackB=[]] - An optional array to keep track of traversed values in the second argument. This is used to handle circular references.
 *
 * @returns {boolean} - Returns true if the values are equivalent, false otherwise.
 *
 * @example
 * // returns true
 * equals([1, 2, 3], [1, 2, 3]);
 *
 * @example
 * // returns false
 * equals({ a: 1 }, { a: 2 });
 *
 * @example
 * // returns true
 * equals({ a: { b: 1 } }, { a: { b: 1 } });
 *
 * @example
 * // returns false (different structure)
 * equals({ a: { b: 1 } }, { a: 1, b: 1 });
 *
 * @example
 * // returns true (handles circular references)
 * var a = {}, b = {};
 * a.self = a;
 * b.self = b;
 * equals(a, b);
 *
 * Note: This function also checks for the presence of 'fantasy-land/equals' or 'equals' methods on the values and uses them for comparison if they exist.
 * It also handles comparison of different types of values like 'Arguments', 'Array', 'Object', 'Boolean', 'Number', 'String', 'Date', 'Error', 'RegExp', 'Map', 'Set', and typed arrays.
 *
 */
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
        stackA.concat([ a ]),
        stackB.concat([ b ]),
      );
    case 'Set':
      if (a.size !== b.size) {
        return false;
      }

      return _uniqContentEquals(
        a.values(),
        b.values(),
        stackA.concat([ a ]),
        stackB.concat([ b ]),
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

  const extendedStackA = stackA.concat([ a ]);
  const extendedStackB = stackB.concat([ b ]);

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
