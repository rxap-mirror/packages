/**
 * `DebounceCall` is a method decorator that delays the execution of the method it decorates.
 * It is used to ensure that time-consuming tasks do not fire so often, which can lead to performance issues.
 *
 * @export
 * @function
 * @param {number} [delay=300] - The delay in milliseconds before the decorated method is called. Default is 300ms.
 * @returns {MethodDecorator} - A method decorator that can be applied to a method with the '@' syntax.
 *
 * @example
 * ```typescript
 * class MyClass {
 * @DebounceCall(500)
 * myMethod() {
 * // This method will be debounced
 * }
 * }
 * ```
 *
 * @remarks
 * The decorator works by replacing the descriptor's value (the original method) with a new function that clears any existing timeout and sets a new one each time the method is called.
 * The new timeout will call the original method after the specified delay.
 * The timeout ID is stored on the instance using a unique key derived from the method's name.
 *
 * @param target - The prototype of the class (or the constructor function for a static method).
 * @param propertyKey - The name of the method being decorated.
 * @param descriptor - The Property Descriptor for the method.
 *
 * @throws {TypeError} - Throws a TypeError if the `propertyKey` is not a string.
 */
export function DebounceCall(delay = 300): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: TypedPropertyDescriptor<any>) {

    if (typeof propertyKey === 'string') {
      const original = descriptor.value;
      const key = `__timeout__${ propertyKey }`;

      descriptor.value = function (...args: any[]) {
        clearTimeout(Reflect.get(this, key));
        Reflect.set(this, key, setTimeout(() => original.apply(this, args), delay));
      };

    }

    return descriptor;
  };
}
