import { RxapUtilitiesError } from '../error';

/**
 * This function asserts whether the provided value is an array or not. If the value is not an array, it throws an error.
 *
 * @export
 * @function assertIsArray
 *
 * @param {any} value - The value to be checked. This can be of any type.
 *
 * @param {string} [message='Value is not an array'] - An optional parameter that represents the error message to be thrown when the value is not an array.
 * If no message is provided, the default message 'Value is not an array' will be used.
 *
 * @throws {RxapUtilitiesError} - Throws an error if the provided value is not an array. The error message will be the one provided as the second parameter, or the default message if none is provided.
 *
 * @returns {asserts value} - If the provided value is an array, the function will return without throwing an error. The return type is 'asserts value', which means that TypeScript will treat the value as an array in the code following the call to this function.
 *
 * @example
 * assertIsArray([1, 2, 3]); // No error will be thrown
 * assertIsArray('not an array'); // Throws an error with the default message
 * assertIsArray('not an array', 'Custom error message'); // Throws an error with the custom message
 *
 * @see {@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions} for more information on assertion functions in TypeScript.
 */
export function assertIsArray(value: any, message = 'Value is not an array'): asserts value is any[] {
  if (!Array.isArray(value)) {
    throw new RxapUtilitiesError(message, '', 'assertsArray');
  }
}
