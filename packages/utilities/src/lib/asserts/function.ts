/* eslint-disable @typescript-eslint/ban-types */
import { RxapUtilitiesError } from '../error';

/**
 * This function asserts whether the provided value is a function or not. If the value is not a function, it throws an error.
 *
 * @export
 * @function assertIsFunction
 *
 * @param {any} value - The value to be checked. It can be of any type.
 *
 * @param {string} [message='Value is not a function'] - Optional. The custom error message to be thrown when the value is not a function.
 * If not provided, the default message 'Value is not a function' will be used.
 *
 * @throws {RxapUtilitiesError} - Throws an error if the provided value is not a function. The error message will be the one provided as the second parameter,
 * or the default message if no custom message is provided.
 *
 * @returns {asserts value} - If the provided value is a function, the function will end successfully, asserting that the value is indeed a function.
 *
 * @example
 * assertIsFunction(() => {}, 'This is not a function'); // No error will be thrown
 * assertIsFunction('Not a function', 'This is not a function'); // Throws an error with message 'This is not a function'
 *
 * @see {@link RxapUtilitiesError}
 */
export function assertIsFunction(value: any, message = 'Value is not a function'): asserts value is Function {
  if (!value || typeof value !== 'function') {
    throw new RxapUtilitiesError(message, '', 'assertsFunction');
  }
}
