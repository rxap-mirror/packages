/**
 * Checks if the provided method string is a valid HTTP method.
 *
 * This function determines if the given string corresponds to one of the common HTTP methods
 * used in web development. It specifically checks for 'get', 'put', 'post', 'delete', or 'patch'.
 *
 * @param method - The method string to check.
 * @returns True if the method is one of the specified HTTP methods, false otherwise.
 *
 * @example
 * IsHttpMethod('get'); // returns true
 * IsHttpMethod('post'); // returns true
 * IsHttpMethod('connect'); // returns false
 */
export function IsHttpMethod(method: string): method is 'get' | 'put' | 'post' | 'delete' | 'patch' {
  return [ 'get', 'put', 'post', 'delete', 'patch' ].includes(method);
}
