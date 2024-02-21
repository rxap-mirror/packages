/**
 * Coerces a prefix onto a string if it does not already end with that prefix.
 *
 * @export
 * @function CoercePrefix
 * @param {string} str - The string to which the prefix will be appended.
 * @param {string} prefix - The prefix to append to the string.
 * @param {RegExp} [regexp] - Optional. A regular expression to match against the string. If not provided, a new RegExp will be created that matches the prefix at the end of the string.
 *
 * @returns {string} - Returns the original string if it matches the regular expression or if it already ends with the prefix. Otherwise, returns the original string with the prefix appended.
 *
 * @example
 * // returns '!Hello World'
 * CoercePrefix('Hello World', '!', /!$/)
 *
 * @example
 * // returns '!Hello World'
 * CoercePrefix('Hello World', '!')
 *
 * @example
 * // returns '!Hello World'
 * CoercePrefix('!Hello World!', '!')
 */
export function CoercePrefix(str: string, prefix: string, regexp?: RegExp): string {

  if (!str.match(regexp ?? new RegExp(`^${ prefix }`))) {
    return prefix + str;
  }

  return str;

}
