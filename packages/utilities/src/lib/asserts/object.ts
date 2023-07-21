import { RxapUtilitiesError } from '../error';

/**
 * This function asserts whether a given value is an object or not. If the value is not an object, it throws an error.
 *
 * @export
 * @function assertIsObject
 *
 * @param {any} value - The value to be checked. It can be of any type.
 * @param {string} [message='Value is not an object'] - Optional. The custom error message to be thrown when the value is not an object. Default is 'Value is not an object'.
 *
 * @throws {RxapUtilitiesError} - Throws an error if the value is not an object. The error message is either the default one or the custom one provided in the 'message' parameter.
 *
 * @returns {asserts value is object} - If the value is an object, the function returns nothing and the execution continues. If the value is not an object, the function throws an error and the execution stops.
 *
 * @example
 * assertIsObject({}); // Execution continues, no error thrown
 * assertIsObject('not an object'); // Throws an error with the default message 'Value is not an object'
 * assertIsObject('not an object', 'Custom error message'); // Throws an error with the custom message 'Custom error message'
 *
 * @see {@link RxapUtilitiesError}
 */
export function assertIsObject(value: any, message = 'Value is not an object'): asserts value is object {
  if (!value || typeof value !== 'object') {
    throw new RxapUtilitiesError(message, '', 'assetsObject');
  }
}
