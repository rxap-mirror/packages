export function isPromiseLike<T = any>(obj: any): obj is PromiseLike<T> {
  return typeof obj === 'object' && obj && typeof obj.then === 'function';
}

export function isPromise<T = any>(obj: any): obj is Promise<T> {
  return obj instanceof Promise;
}
