import { map } from 'rxjs/operators';

/**
 * Transforms a stream of values to boolean values based on a specific condition.
 *
 * This function utilizes a mapping function that converts each value in the input stream:
 * - If the value is the string 'false' (case-sensitive), it is explicitly converted to boolean `false`.
 * - For all other values, JavaScript's `Boolean` constructor is used for conversion. This means:
 * - Truthy values (e.g., non-empty strings, non-zero numbers) are converted to `true`.
 * - Falsy values (e.g., empty strings, 0, `null`, `undefined`, `NaN`) are converted to `false`, except the string 'false' which is handled explicitly.
 *
 * Note: This function is designed to be used with a stream of values, where each value is processed individually.
 *
 * @returns A function that takes a stream of any type and maps each element to a boolean value based on the described logic.
 */
export function toBoolean() {
  return map<any, boolean>(value => value === 'false' ? false : Boolean(value));
}
