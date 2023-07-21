/**
 * The `coerceArray` function is a utility function that ensures the input value is always returned as an array.
 * It accepts a generic type `T` which can be any valid TypeScript type.
 *
 * @export
 * @function coerceArray
 * @template T - The type of elements that the array will contain.
 * @param {(T | T[] | null)} [value] - The input value to be coerced into an array. This can be a single value of type `T`, an array of type `T`, or `null`.
 *
 * If the input value is `null` or `undefined`, the function will return an empty array.
 * If the input value is an array, the function will return the input value as is.
 * If the input value is a single value (not an array), the function will return an array containing the single value.
 *
 * @returns {T[]} - Returns an array of type `T`. If the input was `null` or `undefined`, an empty array is returned. If the input was an array, the same array is returned. If the input was a single value, an array containing the single value is returned.
 *
 * @example
 * // returns [1, 2, 3]
 * coerceArray([1, 2, 3]);
 *
 * @example
 * // returns ['hello']
 * coerceArray('hello');
 *
 * @example
 * // returns []
 * coerceArray(null);
 */
export function coerceArray<T>(value?: T | T[] | null): T[] {
  return value === null || value === undefined ? [] : Array.isArray(value) ? value : [ value ];
}
