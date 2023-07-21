export const PROXY_TARGET = Symbol('proxy-target');

/**
 * `GetProxyTarget` is a generic function that retrieves the proxy target of a given object.
 *
 * @template T - The type of the object for which the proxy target is to be retrieved.
 *
 * @param {T} object - The object for which the proxy target is to be retrieved.
 *
 * @returns {T} - Returns the proxy target of the provided object. The proxy target is the original object which the proxy virtualizes.
 *
 * @remarks
 * This function uses the `PROXY_TARGET` symbol to access the proxy target. The `PROXY_TARGET` symbol is assumed to be globally available and should be set to the property key under which the proxy target is stored.
 *
 * @example
 * Assuming `PROXY_TARGET` is set to the symbol for the property key '_target':
 * ```
 * const myObject = new Proxy({ _target: 'original object' }, {});
 * console.log(GetProxyTarget(myObject)); // logs: 'original object'
 * ```
 *
 * @throws {TypeError} - Throws a TypeError if the provided object is not a Proxy or does not have a proxy target.
 */
export function GetProxyTarget<T>(object: T): T {
  return (object as any)[PROXY_TARGET];
}
