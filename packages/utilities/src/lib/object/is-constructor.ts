// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function isConstructor<T>(fn: Function): fn is new (...args: T[]) => T {
  return fn.prototype && fn.prototype.constructor === fn;
}
