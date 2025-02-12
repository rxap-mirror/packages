/**
 * A decorator factory that delegates a method implementation to a provided function.
 *
 * @summary
 * Creates a method decorator that assigns a given function as the implementation of the decorated method.
 *
 * @param method - The function to be used as the implementation for the decorated method. Can accept any number and type of arguments.
 *
 * @returns A method decorator function that will assign the provided implementation to the target class's prototype.
 *
 * @example
 * ```typescript
 * class Example {
 *   @delegate(function(x: number) { return x * 2; })
 *   multiply(x: number): number {
 *     // The actual implementation is provided by the delegate
 *     return 0; // This return is never reached
 *   }
 * }
 *
 * const example = new Example();
 * console.log(example.multiply(5)); // Outputs: 10
 * ```
 *
 * @throws Will throw a TypeError if used on anything other than a class method.
 */
export function delegate(method: (...args: any[]) => any) {
  return function (target: any, propertyKey: string) {
    target.constructor.prototype[propertyKey] = method;
  };
}
