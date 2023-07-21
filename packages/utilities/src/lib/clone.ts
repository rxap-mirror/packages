/**
 * Creates a new RegExp object that is a clone of an existing RegExp object.
 *
 * @param {any} pattern - The RegExp object to be cloned. This parameter should be a valid RegExp object.
 *
 * @returns {RegExp} A new RegExp object that has the same pattern and flags as the input RegExp object.
 * The flags are determined by the properties of the input RegExp object:
 * - global: If true, the 'g' flag is included.
 * - ignoreCase: If true, the 'i' flag is included.
 * - multiline: If true, the 'm' flag is included.
 * - sticky: If true, the 'y' flag is included.
 * - unicode: If true, the 'u' flag is included.
 *
 * @example
 * let regex = /abc/gi;
 * let clonedRegex = cloneRegExp(regex);
 * // clonedRegex is now a new RegExp object with the same pattern and flags as regex
 *
 * @throws {TypeError} If the input is not a valid RegExp object, a TypeError will be thrown.
 */
function cloneRegExp(pattern: any) {
  return new RegExp(
    pattern.source,
    (pattern.global ? 'g' : '') +
    (pattern.ignoreCase ? 'i' : '') +
    (pattern.multiline ? 'm' : '') +
    (pattern.sticky ? 'y' : '') +
    (pattern.unicode ? 'u' : ''),
  );
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
 * Copies an object.
 *
 * @private
 * @param {*} value The value to be copied
 * @param {Array} refFrom Array containing the source references
 * @param {Array} refTo Array containing the copied source references
 * @param {Boolean} deep Whether or not to perform deep cloning.
 * @return {*} The copied value.
 */
export function clone<Data>(
  value: Data,
  refFrom: any[] = [],
  refTo: any[] = [],
  deep = true,
): Data {
  function copy(copiedValue: any) {
    const len = refFrom.length;
    let idx = 0;
    while (idx < len) {
      if (value === refFrom[idx]) {
        return refTo[idx];
      }
      idx += 1;
    }
    refFrom[idx] = value;
    refTo[idx] = copiedValue;
    for (const key in value) {
      // eslint-disable-next-line no-prototype-builtins
      if ((value as any).hasOwnProperty && (value as any).hasOwnProperty(key)) {
        copiedValue[key] = deep
          ? clone(value[key], refFrom, refTo, true)
          : value[key];
      }
    }
    return copiedValue;
  }

  switch (type(value)) {
    case 'Object':
      return copy(Object.create(Object.getPrototypeOf(value)));
    case 'Array':
      return copy([]);
    case 'Date':
      return new Date((value as any).valueOf()) as any;
    case 'RegExp':
      return cloneRegExp(value) as any;
    case 'Int8Array':
    case 'Uint8Array':
    case 'Uint8ClampedArray':
    case 'Int16Array':
    case 'Uint16Array':
    case 'Int32Array':
    case 'Uint32Array':
    case 'Float32Array':
    case 'Float64Array':
    case 'BigInt64Array':
    case 'BigUint64Array':
      return (value as any).slice();
    default:
      return value;
  }
}
