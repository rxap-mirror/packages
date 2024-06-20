import { tap } from 'rxjs/operators';

/**
 * Logs a transformed value to the console with an optional message.
 *
 * This function is a utility that allows logging of transformed data, primarily for debugging purposes. It uses a higher-order function `tap` to intercept and log the value without affecting the flow of data in a pipeline.
 *
 * @param {string} [message] - Optional. A message to prefix the logged data, providing context in the log output.
 * @param {(value: any) => any} [transform=(value) => value] - Optional. A function to transform the value before logging. Defaults to an identity function, which returns the value unchanged.
 * @returns A function that takes a value of generic type `T`, applies the `transform` function to it, and logs the result along with the provided message. The original value is passed through without modification.
 * @template T - The type of the value being logged.
 *
 * @example
 * // Logs "Value: 42"
 * log<number>()(42);
 *
 * @example
 * // Logs "Result: 84" after doubling the input value
 * log<number>('Result:', x => x * 2)(42);
 */
export function log<T>(message?: string, transform: (value: any) => any = value => value) {
  return tap<T>(value => console.log(message, transform(value)));
}
