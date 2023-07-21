import { Constructor } from './helpers';

/**
 * Asserts that a given instance is an instance of a specific constructor. If the assertion fails, an error is thrown.
 *
 * @template T The expected type of the instance.
 *
 * @param {any} instance The instance to be checked.
 * This parameter represents the object instance that is to be verified if it is an instance of the specified constructor.
 *
 * @param {Constructor<T>} constructor The constructor function of the expected type.
 * This parameter represents the constructor function of the expected type of the instance. The function will check if the provided instance is an instance of this constructor.
 *
 * @param {string} [constructorName=constructor.name] The name of the constructor function.
 * This optional parameter represents the name of the constructor function. If not provided, the function will use the name of the constructor function passed as the second parameter.
 * This name is used in the error message if the assertion fails.
 *
 * @throws {Error} Throws an error if the instance is not an instance of the specified constructor.
 * The error message will contain the name of the expected constructor.
 *
 * @returns {asserts instance is T} If the instance is an instance of the constructor, the function will return nothing and the TypeScript compiler will know that the instance is of type T after this function call.
 *
 * @example
 * class MyClass {}
 * const myInstance = new MyClass();
 * AssertsInstanceOf<MyClass>(myInstance, MyClass); // No error
 * AssertsInstanceOf<MyClass>({}, MyClass); // Throws an error: "Instance should be instance of MyClass!"
 *
 */
export function AssertsInstanceOf<T>(
  instance: any,
  constructor: Constructor<T>,
  constructorName: string = constructor.name,
): asserts instance is T {
  if (!(instance instanceof constructor)) {
    throw new Error(`Instance should be instance of ${ constructorName }!`);
  }
}
