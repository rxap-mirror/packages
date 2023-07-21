export interface RxapOnInit {
  rxapOnInit(): void;
}

/**
 * Checks if the provided object has a method named 'rxapOnInit'.
 *
 * @export
 * @function HasRxapOnInitMethod
 * @param {any} obj - The object to be checked. This can be of any type.
 * @returns {boolean} Returns true if the object has a method named 'rxapOnInit', otherwise returns false.
 *
 * @example
 * // returns true
 * HasRxapOnInitMethod({ rxapOnInit: function() {} });
 *
 * @example
 * // returns false
 * HasRxapOnInitMethod({ noRxapOnInit: function() {} });
 *
 * @description
 * This function is used to determine if a given object has a method named 'rxapOnInit'.
 * It is a type guard function that checks if the 'rxapOnInit' property of the object is a function.
 * This is useful in scenarios where you need to ensure that an object implements a specific interface or has certain methods.
 * The function uses the 'typeof' operator to check if the 'rxapOnInit' property of the object is a function.
 */
export function HasRxapOnInitMethod(obj: any): obj is RxapOnInit {
  return obj && typeof obj.rxapOnInit === 'function';
}
