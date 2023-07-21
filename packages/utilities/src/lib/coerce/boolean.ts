/**
 * This function takes any input value and coerces it into a boolean value.
 *
 * @export
 * @function coerceBoolean
 * @param {any} value - The input value to be coerced into a boolean. This can be of any type.
 * @returns {boolean} - The function returns a boolean value. It will return true if the input value is not undefined, not null, and not false. Otherwise, it will return false.
 *
 * @example
 * // returns: true
 * coerceBoolean('Hello');
 *
 * @example
 * // returns: false
 * coerceBoolean(null);
 *
 * @example
 * // returns: false
 * coerceBoolean(undefined);
 *
 * @example
 * // returns: false
 * coerceBoolean(false);
 *
 * Note: This function does not perform a strict type check. It only checks if the value is not undefined, not null, and not false. Therefore, it will return true for any truthy value and false for any falsy value except for the boolean false.
 */
export function coerceBoolean(value: any): boolean {
  return value !== undefined && value !== null && value !== false;
}
