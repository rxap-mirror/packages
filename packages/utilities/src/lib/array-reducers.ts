/**
 * The `objectReducer` function is a generic function that merges two objects of the same type `T`.
 * It takes two arguments, both of which are objects of type `T` or a subset of `T` (Partial<T>).
 * The function returns a new object that contains all the properties of the input objects.
 * If both input objects have a property with the same key, the value from the second object (`b`) will overwrite the value from the first object (`a`).
 *
 * @template T - The type of the objects to be merged. `T` must extend `object`.
 *
 * @param {Partial<T>} a - The first object to be merged. This object can be a subset of `T`.
 *
 * @param {Partial<T>} b - The second object to be merged. This object can be a subset of `T`.
 * If `b` has a property with the same key as `a`, the value in `b` will overwrite the value in `a`.
 *
 * @returns {Partial<T>} - A new object that contains all the properties of `a` and `b`.
 * If `a` and `b` have properties with the same key, the value from `b` will be used.
 *
 * @example
 * // returns { x: 2, y: 2 }
 * objectReducer({ x: 1, y: 2 }, { x: 2 });
 *
 * @example
 * // returns { name: 'John', age: 30 }
 * objectReducer({ name: 'John' }, { age: 30 });
 *
 */
export function objectReducer<T extends object>(a: Partial<T>, b: Partial<T>): Partial<T> {
  return { ...a, ...b };
}
