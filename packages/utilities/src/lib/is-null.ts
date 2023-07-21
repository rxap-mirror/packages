/**
 * This function checks if the provided value is null.
 *
 * @template T - The type of the value to be checked. It can be any valid TypeScript type.
 *
 * @param {T | null} value - The value to be checked. It can be of any type T or null.
 *
 * @returns {boolean} - The function returns a boolean value. It returns true if the provided value is null, otherwise it returns false.
 *
 * @example
 * IsNull(null); // returns true
 * IsNull(123); // returns false
 * IsNull("Hello"); // returns false
 *
 * @export
 */
export function IsNull<T>(value: T | null): value is null {
  return value === null;
}

/**
 * This function checks if a given value is not null.
 *
 * @export
 * @template T - The type of the value to be checked. This can be any valid TypeScript type.
 * @param {T | null} value - The value to be checked. This can be of type T or null.
 * @returns {boolean} - The function returns a boolean value. If the value is not null, it returns true; otherwise, it returns false.
 *
 * @example
 * // returns: true
 * IsNotNull(5);
 *
 * @example
 * // returns: false
 * IsNotNull(null);
 *
 * @example
 * // returns: true
 * IsNotNull("Hello");
 *
 * @example
 * // returns: false
 * IsNotNull(undefined);
 *
 * Note: This function uses the IsNull function to perform the null check. Ensure that the IsNull function is properly defined and imported for this function to work correctly.
 */
export function IsNotNull<T>(value: T | null): value is T {
  return !IsNull(value);
}
