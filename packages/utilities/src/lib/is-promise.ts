/**
 * Checks if a given object is Promise-like.
 *
 * A Promise-like object (also known as "thenable") is an object that has a `then` method.
 * This function checks if the provided object is an instance of an object and if it has a `then` method.
 *
 * @template T - The type of the result that the Promise may resolve to. This is any by default.
 *
 * @param {any} obj - The object to be checked.
 *
 * @returns {boolean} Returns true if the object is Promise-like (i.e., it's an object and has a `then` method), otherwise false.
 *
 * @example
 *
 * isPromiseLike({ then: function() {} });  // returns true
 * isPromiseLike(null);  // returns false
 * isPromiseLike(42);  // returns false
 * isPromiseLike(Promise.resolve(42));  // returns true
 *
 * @export
 */
export function isPromiseLike<T = any>(obj: any): obj is PromiseLike<T> {
  return typeof obj === 'object' && obj && typeof obj.then === 'function';
}

/**
 * Checks if a given object is an instance of a Promise.
 *
 * @template T - The type of the value that the Promise may resolve to. By default, this is any type.
 *
 * @param {any} obj - The object to be checked.
 *
 * @returns {boolean} - Returns true if the object is an instance of Promise<T>, otherwise returns false.
 *
 * @example
 * // returns: true
 * isPromise(new Promise(() => {}));
 *
 * @example
 * // returns: false
 * isPromise({});
 *
 * @remarks
 * This function uses the `instanceof` operator to check if the object is a Promise.
 * It does not check if the object behaves like a Promise (i.e., has a `.then` method),
 * so objects that are not instances of the global Promise constructor but still behave like Promises will return false.
 */
export function isPromise<T = any>(obj: any): obj is Promise<T> {
  return obj instanceof Promise;
}
