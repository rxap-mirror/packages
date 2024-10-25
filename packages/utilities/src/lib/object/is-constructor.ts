// eslint-disable-next-line @typescript-eslint/ban-types
export function isConstructor<T>(fn: Function): fn is new (...args: T[]) => T {
  return fn.prototype && fn.prototype.constructor === fn;
}
