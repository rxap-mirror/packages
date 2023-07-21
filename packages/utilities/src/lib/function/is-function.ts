/**
 * This function checks if a given value is a function or not.
 *
 * @template ReturnType The expected return type of the function.
 * @template ArgumentTypes An array type representing the expected argument types of the function.
 *
 * @param {any} value The value to be checked.
 *
 * @returns {boolean} Returns true if the provided value is a function, otherwise returns false.
 *
 * @example
 *
 * // returns: true
 * IsFunction<Number, [string, number]>((a: string, b: number) => a.length + b);
 *
 * // returns: false
 * IsFunction<Number, [string, number]>(123);
 *
 * @remarks
 * This function uses TypeScript's type predicates, so it not only checks if the value is a function,
 * but also narrows down the type of the value if it is a function.
 */
export function IsFunction<ReturnType, ArgumentTypes extends any[]>(value: any): value is ((...args: ArgumentTypes) => ReturnType) {
  return typeof value === 'function';
}
