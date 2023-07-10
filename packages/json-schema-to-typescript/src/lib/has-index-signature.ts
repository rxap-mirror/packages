export type WithIndexSignature<T> = T & Record<string, any>;

export function hasIndexSignature<T>(obj: T): obj is T & Record<string, any> {
  return typeof obj === 'object' && !!obj;
}
