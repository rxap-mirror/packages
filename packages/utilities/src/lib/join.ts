/**
 * Joins multiple path fragments into a single, normalized path string.
 *
 * @export
 * @function JoinPath
 * @param {...Array<string | null | undefined>} fragments - An array of path fragments. Each fragment can be a string, null, or undefined.
 *
 * The function performs the following operations:
 * 1. Filters out any null or undefined fragments.
 * 2. Filters out any fragments that consist solely of forward slashes ('/').
 * 3. Trims leading and trailing forward slashes from each fragment.
 * 4. Joins the remaining fragments into a single string, with each fragment separated by a single forward slash.
 * 5. Trims any trailing forward slashes from the resulting string.
 *
 * @returns {string} The resulting path string after all transformations have been applied. If all fragments are null, undefined, or consist solely of forward slashes, the function returns an empty string.
 *
 * @example
 * JoinPath('path/', '/to', null, 'file/') // returns 'path/to/file'
 * JoinPath('////', null, undefined) // returns ''
 */
export function JoinPath(...fragments: Array<string | null | undefined>) {
  return fragments
    .filter(Boolean)
    .filter(fragment => !fragment!.match(/^\/+$/))
    .map(fragment => fragment!
      .replace(/\/+$/, '')
      .replace(/^\/+/, ''),
    )
    .join('/')
    .replace(/\/+$/, '');
}

/**
 * @deprecated use JoinPath instead
 */
export const joinPath = JoinPath;

export interface JoinWithOptions {
  strict?: boolean;
  removeDuplicated?: boolean;
  removeEmpty?: boolean;
}

/**
 * This function joins an array of strings, undefined, or null values into a single string with a specified separator.
 * It also provides options to control the joining process.
 *
 * @export
 * @param {Array<string | undefined | null>} items - The array of items to be joined. The items can be strings, undefined, or null.
 * @param {string} [separator='-'] - The separator to be used in joining the items. If not provided, the default separator is '-'.
 * @param {JoinWithOptions} [options={}] - An optional object that controls the joining process. It can have the following properties:
 * - strict: If true, the function will throw an error if any item in the array is null, undefined, or an empty string.
 * - removeDuplicated: If true, the function will remove duplicate items from the array before joining.
 * - removeEmpty: If true, the function will remove null, undefined, and empty string items from the array before joining.
 * @returns {string} - The joined string.
 * @throws {Error} - Throws an error if the 'strict' option is true and any item in the array is null, undefined, or an empty string.
 */
export function joinWith(items: Array<string | undefined | null>, separator = '-', options: JoinWithOptions = {}) {
  if (options.strict) {
    if (items.some(item => item === null || item === undefined || item === '')) {
      throw new Error('Invalid join items');
    }
  }
  if (options.removeDuplicated) {
    items = [ ...Array.from(new Set(items).values()) ];
  }
  if (options.removeEmpty) {
    items = items.filter(item => item !== null && item !== undefined && item !== '');
  }
  return items.filter(item => item !== null && item !== undefined && item !== '').join(separator);
}

/**
 * This function joins an array of strings, undefined, or null values with a dash ("-") as a separator.
 * It uses the `joinWith` function to perform the operation.
 *
 * @export
 * @function joinWithDash
 * @param {Array<string | undefined | null>} items - An array of strings, undefined, or null values to be joined.
 * @param {JoinWithOptions} [options={}] - An optional parameter that specifies the options for the `joinWith` function. Defaults to an empty object if not provided.
 *
 * @returns {string} - Returns a single string that is the result of joining all the elements in the `items` array with a dash ("-"). If an element in the array is undefined or null, it will be treated as an empty string.
 *
 * @example
 * // returns "hello-world"
 * joinWithDash(["hello", "world"])
 *
 * @example
 * // returns "hello--world"
 * joinWithDash(["hello", undefined, "world"])
 *
 * @example
 * // returns "hello-world"
 * joinWithDash(["hello", "world"], { skipEmpty: true })
 *
 */
export function joinWithDash(items: Array<string | undefined | null>, options: JoinWithOptions = {}) {
  return joinWith(items, '-', options);
}
