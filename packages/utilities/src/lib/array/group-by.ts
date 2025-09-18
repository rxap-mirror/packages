/**
 * Groups the elements of an array based on the value of a specific property.
 *
 * @template T - The type of the elements in the array.
 * @template K - The type of the property key.
 * @template MK - The type of the grouping key.
 *
 * @param {T[]} list - The array of objects to be grouped.
 * @param {K} propertyKey - The key of the property used to group the objects.
 * @return {Map<MK, T[]>} A Map where the keys represent unique property values and the values are arrays of objects that share the corresponding property value.
 */
export function GroupBy<T, K extends keyof T, MK = T[K]>(list: T[], propertyKey: K): Map<MK, T[]>;
/**
 * Groups an array of objects into a `Map` based on a specified property or transformation function.
 *
 * @template T - The type of the elements in the array.
 * @template K - The type of the property key.
 * @template MK - The type of the grouping key.
 *
 * @param {T[]} list - The array of elements to group.
 * @param {(item: T) => MK} propertyFunction - A function that returns the property or transformation result used for grouping each element.
 * @return {Map<MK, T[]>} A `Map` where the keys are derived from the `propertyFunction` and the values are arrays of objects sharing the same key.
 */
export function GroupBy<T, K extends keyof T, MK = T[K]>(list: T[], propertyFunction: ((item: T) => MK)): Map<MK, T[]>;
/**
 * Groups elements of an array based on a specified property or function.
 *
 * @template T - The type of the elements in the array.
 * @template K - The type of the property key.
 * @template MK - The type of the grouping key.
 *
 * @param {T[]} list - The array of items to be grouped.
 * @param {K | ((item: T) => MK)} propertyKeyOrFunction - A property key or a function to determine the grouping key for each item.
 * @return {Map<MK, T[]>} A map where keys are the grouping key, and values are arrays of grouped items.
 */
export function GroupBy<T, K extends keyof T, MK = T[K]>(list: T[], propertyKeyOrFunction: K | ((item: T) => MK)): Map<MK, T[]> {
  const map = new Map<MK, T[]>();

  for (const item of list) {

    const key = typeof propertyKeyOrFunction === 'function' ? propertyKeyOrFunction(item) : item[propertyKeyOrFunction] as MK;

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(item);

  }

  return map;
}
