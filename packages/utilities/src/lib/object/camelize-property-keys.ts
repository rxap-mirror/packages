import { camelize } from '../strings';

export type CamelCase<T extends string> =
  string extends T ? string :
  T extends `${ infer P1 }_${ infer P2 }` ?
  `${ Lowercase<P1> }${ Capitalize<CamelCase<P2>> }` :
  Lowercase<T>;

// Mapped type to apply camelization to all keys of an object
export type CamelizedKeys<T> = {
  [K in keyof T as CamelCase<string & K>]: T[K];
};


export function CamelizePropertyKeys<T>(obj: T): CamelizedKeys<T> & T {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const normalizedKey = camelize(key);
      if (normalizedKey !== key) {
        (
          obj as any
        )[normalizedKey] = obj[key];
      }
    }
  }
  return obj as CamelizedKeys<T> & T;
}
