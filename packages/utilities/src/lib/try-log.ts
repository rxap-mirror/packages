/**
 * `TryAndLogOnError` is a higher-order function that wraps a provided function `fnc` in a try-catch block.
 * If an error is thrown during the execution of `fnc`, the error message is logged to the console and a default result is returned.
 *
 * @template T The expected return type of the function `fnc`.
 * @template A An array-like type representing the arguments of the function `fnc`.
 *
 * @param {(...args: A) => T} fnc The function to be wrapped in a try-catch block. This function is expected to take arguments of type `A` and return a value of type `T`.
 * @param {T | null} [defaultResult=null] The default result to be returned if an error is thrown during the execution of `fnc`. If not provided, the default value is `null`.
 *
 * @returns {(...args: A) => T | null} A new function that takes the same arguments as `fnc` and returns a value of type `T` or `null`.
 * This function will execute `fnc` with the provided arguments, log any error that occurs during execution, and return either the result of `fnc` or the default result.
 *
 * @example
 * const safeDivide = TryAndLogOnError((x: number, y: number) => x / y, Infinity);
 * const result = safeDivide(4, 0); // Logs error and returns Infinity
 *
 */
export function TryAndLogOnError<T, A extends any[]>(
  fnc: (...args: A) => T,
  defaultResult: T | null = null,
): (...args: A) => T | null {
  return (...args: A) => {

    let result = defaultResult;

    try {
      result = fnc(...args);
    } catch (e: any) {
      console.error(e.message, e);
    }

    return result;

  };
}

/**
 * `TryAndLogOnErrorAsync` is a higher-order function that wraps a provided function `fnc` with error handling logic.
 * It attempts to execute `fnc` and logs any errors that occur during its execution. If an error is thrown, it returns a default result.
 *
 * @template T The expected return type of the function `fnc`.
 * @template A An array-like type representing the arguments of the function `fnc`.
 *
 * @param {(...args: A) => T | Promise<T>} fnc The function to be executed. This function can be either synchronous or asynchronous.
 * It should return a value of type `T` or a Promise that resolves to a value of type `T`.
 *
 * @param {T | null} [defaultResult=null] The default result to be returned if an error is thrown during the execution of `fnc`.
 * If not provided, the default value is `null`.
 *
 * @returns {(...args: A) => Promise<T | null>} A function that takes the same arguments as `fnc` and returns a Promise.
 * The Promise will resolve to the result of `fnc` if it executes successfully, or to `defaultResult` if an error is thrown.
 * Any error that occurs during the execution of `fnc` will be logged to the console.
 *
 * @example
 * const safeDivide = TryAndLogOnErrorAsync((x, y) => x / y, 'Error');
 * safeDivide(10, 2).then(console.log); // Logs 5
 * safeDivide(10, 0).then(console.log); // Logs 'Error' and logs the error to the console
 */
export function TryAndLogOnErrorAsync<T, A extends any[]>(
  fnc: (...args: A) => T | Promise<T>,
  defaultResult: T | null = null,
): (...args: A) => Promise<T | null> {
  return async (...args: A) => {

    let result = defaultResult;

    try {
      result = await fnc(...args);
    } catch (e: any) {
      console.error(e.message, e);
    }

    return result;

  };
}
