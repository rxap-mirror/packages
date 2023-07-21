import {
  IsNotNull,
  IsNull,
} from './is-null';
import { RxapUtilitiesError } from './error';

/**
 * This function checks if a given value is defined or not.
 *
 * @template T - The type of the value to be checked. This can be any valid TypeScript type.
 *
 * @param {T | undefined} value - The value to be checked. This can be of any type T or undefined.
 *
 * @returns {boolean} - The function returns a boolean value. It returns true if the value is not undefined, and false otherwise.
 *
 * @example
 *
 * IsDefined<number>(42); // returns true
 * IsDefined<string>(undefined); // returns false
 *
 * @export
 */
export function IsDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * This function checks if a given value is undefined.
 *
 * @export
 * @function IsUndefined
 * @template T - The type of the value to be checked. It can be any valid TypeScript type.
 * @param {(T | undefined)} value - The value to be checked. It can be of type T or undefined.
 * @returns {boolean} - Returns true if the value is undefined, otherwise returns false.
 *
 * @example
 * // returns: true
 * IsUndefined(undefined)
 *
 * @example
 * // returns: false
 * IsUndefined(123)
 *
 * @example
 * // returns: false
 * IsUndefined("Hello World")
 */
export function IsUndefined<T>(value: T | undefined): value is undefined {
  return value === undefined;
}

/**
 * Checks if the provided value is either undefined or null.
 *
 * @template T - The type of the value to be checked. This is a generic type parameter that can represent any type.
 *
 * @param {T | undefined | null} value - The value to be checked. This can be of any type (represented by T), undefined, or null.
 *
 * @returns {boolean} - Returns true if the value is either undefined or null, otherwise returns false.
 *
 * @example
 * // returns: true
 * IsUndefinedOrNull(null);
 *
 * @example
 * // returns: true
 * IsUndefinedOrNull(undefined);
 *
 * @example
 * // returns: false
 * IsUndefinedOrNull('Hello World');
 *
 * @function IsUndefinedOrNull
 */
export function IsUndefinedOrNull<T>(value: T | undefined | null): value is null | undefined {
  return IsUndefined(value) || IsNull(value);
}

/**
 * Checks if a given value is defined and not null.
 *
 * @template T - The type of the value to be checked.
 *
 * @param {T | null | undefined} value - The value to be checked. It can be of type T, null, or undefined.
 *
 * @returns {boolean} - Returns a boolean value indicating whether the input value is both defined and not null.
 * If the value is of type T (i.e., it is defined and not null), the function returns true.
 * If the value is null or undefined, the function returns false.
 *
 * @example
 * // returns: true
 * IsDefinedAndNotNull(5);
 *
 * @example
 * // returns: false
 * IsDefinedAndNotNull(null);
 *
 * @example
 * // returns: false
 * IsDefinedAndNotNull(undefined);
 *
 * @remarks
 * This function uses two helper functions: IsDefined and IsNotNull.
 * IsDefined checks if the value is not undefined, and IsNotNull checks if the value is not null.
 */
export function IsDefinedAndNotNull<T>(value: T | null | undefined): value is T {
  return IsDefined(value) && IsNotNull(value);
}

/**
 * Asserts that a given value is defined. If the value is not defined, it throws an error.
 *
 * @template T - The type of the value to be checked.
 *
 * @param {T | undefined} value - The value to be checked. It can be of any type T or undefined.
 *
 * @param {string} code - A unique identifier for the error. This code is used when throwing an error if the value is not defined.
 *
 * @param {string} [className] - Optional parameter. The name of the class where the error occurred. This is used when throwing an error if the value is not defined.
 *
 * @throws {RxapUtilitiesError} - Throws an error of type RxapUtilitiesError if the value is not defined. The error message will be 'Value is not defined', and it will include the provided code and className (if provided).
 *
 * @returns {asserts value is T} - If the value is defined, the function asserts that the value is of type T. This means that after this function is called, TypeScript will treat the value as being of type T, not T | undefined.
 *
 * @example
 * AssertDefined<string>('Hello', 'ERR001', 'MyClass'); // No error thrown
 * AssertDefined<string>(undefined, 'ERR002', 'MyClass'); // Throws RxapUtilitiesError with message 'Value is not defined'
 *
 * @remarks
 * This function is useful when you want to ensure that a value is defined before you use it. It helps prevent errors caused by trying to use undefined values.
 *
 */
export function AssertDefined<T>(value: T | undefined, code: string, className?: string): asserts value is T {
  if (!IsDefined(value)) {
    throw new RxapUtilitiesError('Value is not defined', code, className);
  }
}

/**
 * Asserts that a given value is defined and not null.
 *
 * @template T - The type of the value to be checked.
 *
 * @param {T | undefined | null} value - The value to be checked. It can be of type T, undefined, or null.
 *
 * @param {string} code - A unique identifier for the error that will be thrown if the value is not defined or is null.
 *
 * @param {string} [className] - Optional. The name of the class where the error occurred. This will be included in the error message if provided.
 *
 * @throws {RxapUtilitiesError} - Throws an error if the value is not defined or is null. The error message will include the provided code and, if provided, the class name.
 *
 * @returns {asserts value is T} - If the function does not throw, it asserts that the value is of type T (i.e., it is defined and not null).
 *
 * @example
 * AssertDefinedAndNotNull(someValue, 'SOME_CODE', 'SomeClass');
 * // If someValue is defined and not null, no error is thrown.
 * // If someValue is not defined or is null, an error is thrown with the message 'Value is not defined or not null', the code 'SOME_CODE', and the class name 'SomeClass'.
 */
export function AssertDefinedAndNotNull<T>(
  value: T | undefined | null,
  code: string,
  className?: string,
): asserts value is T {
  if (!IsDefined(value)) {
    throw new RxapUtilitiesError('Value is not defined or not null', code, className);
  }
}

/**
 * Checks if a given value is empty. A value is considered empty if it is null, undefined, or an empty string.
 *
 * @template T - The type of the value to be checked. This function can handle values of any type.
 *
 * @param {T | null | undefined | ''} value - The value to be checked. This can be of any type (T), null, undefined, or an empty string.
 *
 * @returns {boolean} - Returns true if the value is null, undefined, or an empty string. Otherwise, it returns false.
 *
 * @example
 * IsEmpty(null); // returns true
 * IsEmpty(undefined); // returns true
 * IsEmpty(''); // returns true
 * IsEmpty('Hello'); // returns false
 * IsEmpty(123); // returns false
 * IsEmpty({}); // returns false
 *
 * @see {@link IsUndefinedOrNull} for the function used to check if the value is null or undefined.
 */
export function IsEmpty<T>(value: T | null | undefined | ''): value is null | undefined | '' {
  return IsUndefinedOrNull(value) || value === '';
}

/**
 * Checks if the provided value is not empty.
 *
 * This function uses the IsEmpty function to determine if the provided value is empty.
 * If the value is empty, the function returns false; otherwise, it returns true.
 *
 * @template T - The type of the value to be checked. This can be any type.
 *
 * @param {T | null | undefined | ''} value - The value to be checked. This can be of type T, null, undefined, or an empty string.
 *
 * @returns {boolean} - Returns true if the value is not empty (i.e., not null, not undefined, and not an empty string).
 * Otherwise, it returns false.
 *
 * @example
 * // returns true
 * IsNotEmpty("Hello World");
 *
 * @example
 * // returns false
 * IsNotEmpty("");
 *
 * @example
 * // returns false
 * IsNotEmpty(null);
 *
 * @example
 * // returns false
 * IsNotEmpty(undefined);
 */
export function IsNotEmpty<T>(value: T | null | undefined | ''): value is T {
  return !IsEmpty(value);
}
