/**
 * This function checks if the provided argument is an object.
 *
 * @export
 * @function IsObject
 * @param {any} obj - The argument to be checked.
 * @returns {boolean} - Returns true if the argument is an object, false otherwise.
 *
 * @description
 * The function takes any type of argument and checks if it is an object.
 * It uses the JavaScript 'typeof' operator to determine the type of the argument.
 * If the argument is null or undefined, the function will return false,
 * as these values are considered 'falsy' in JavaScript and are not of type 'object'.
 *
 * Note: This function considers arrays and functions as objects,
 * since in JavaScript, arrays and functions are technically types of objects.
 */
export function IsObject(obj: any): obj is object {
  return obj && typeof obj === 'object';
}

/**
 * Checks if a given object is a non-empty record or an empty object.
 *
 * @export
 * @function IsRecord
 * @param {any} obj - The object to be checked.
 * @returns {boolean} - Returns true if the object is a non-empty record or an empty object, otherwise returns false.
 *
 * @example
 * // returns true
 * IsRecord({ key: 'value' });
 *
 * @example
 * // returns true
 * IsRecord({});
 *
 * @example
 * // returns false
 * IsRecord(null);
 *
 * @example
 * // returns false
 * IsRecord('string');
 *
 * @remarks
 * This function uses the IsObject function to check if the input is an object. It then checks if the object has any keys (i.e., is not empty) or if it is an empty object (i.e., JSON.stringify(obj) === '{}').
 */
export function IsRecord(obj: any): obj is Record<any, any> {
  return IsObject(obj) && (Object.keys(obj).length !== 0 || JSON.stringify(obj) === '{}');
}

/**
 * This function asserts whether the provided value is an object or not.
 *
 * @export
 * @function AssertObject
 * @param {any} obj - The value to be checked.
 * @throws {Error} Will throw an error if the provided value is not an object.
 *
 * The function uses the IsObject function to determine if the provided value is an object. If the value is not an object, it throws an error with a message indicating the type of the provided value. If the value is null or undefined, the error message will include the value itself.
 *
 * The function uses TypeScript's type assertion feature to inform the TypeScript compiler that the provided value is an object if the function does not throw an error. This can be useful in situations where the type of a value is not known at compile time but can be determined at runtime.
 *
 * @example
 * AssertObject({}); // No error
 * AssertObject(123); // Throws Error: The value is not a object instead: 'number'
 * AssertObject(null); // Throws Error: The value is not a object instead: 'null'
 *
 * @returns {void} This function does not return a value.
 */
export function AssertObject(obj: any): asserts obj is object {
  if (!IsObject(obj)) {
    throw new Error(`The value is not a object instead: '${ !obj ? obj : typeof obj }'`);
  }
}

/**
 * Asserts that the provided object is a Record.
 *
 * This function checks if the provided object is a Record (an object-like value with string keys and values of any type).
 * If the object is not a Record, it throws an error with a message indicating the actual type or value of the object.
 *
 * @export
 * @function AssertRecord
 * @param {any} obj - The object to be checked.
 * @throws {Error} Will throw an error if the provided object is not a Record.
 * @returns {asserts obj is Record<any, any>} If the object is a Record, the function completes without returning a value.
 * However, TypeScript interprets this as narrowing the type of `obj` to `Record<any, any>`.
 *
 * @example
 * // If obj is a Record
 * AssertRecord({key: 'value'}); // No output, no error
 *
 * // If obj is not a Record
 * AssertRecord('Not a Record'); // Throws Error: The value is not a record instead: 'string'
 */
export function AssertRecord(obj: any): asserts obj is Record<any, any> {
  if (!IsRecord(obj)) {
    throw new Error(`The value is not a record instead: '${ !obj ? obj : typeof obj }'`);
  }
}

