/**
 * Coerces a suffix onto a string if it does not already end with that suffix.
 *
 * @export
 * @function CoerceSuffix
 * @param {string} str - The string to which the suffix will be appended.
 * @param {string} suffix - The suffix to append to the string.
 * @param {RegExp} [regexp] - Optional. A regular expression to match against the string. If not provided, a new RegExp will be created that matches the suffix at the end of the string.
 *
 * @returns {string} - Returns the original string if it matches the regular expression or if it already ends with the suffix. Otherwise, returns the original string with the suffix appended.
 *
 * @example
 * // returns 'Hello World!'
 * CoerceSuffix('Hello World', '!', /!$/)
 *
 * @example
 * // returns 'Hello World!'
 * CoerceSuffix('Hello World', '!')
 *
 * @example
 * // returns 'Hello World!'
 * CoerceSuffix('Hello World!', '!')
 */
export function CoerceSuffix(str: string, suffix: string, regexp?: RegExp): string {

  if (!str.match(regexp ?? new RegExp(`${ suffix }$`))) {
    return str + suffix;
  }

  return str;

}
