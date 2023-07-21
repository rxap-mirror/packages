/**
 * The `GroupBy` function is a generic function that groups the elements of a list based on a specified property key.
 *
 * @template T - The type of the elements in the list.
 * @template K - The type of the property key. It must be a key of T.
 *
 * @param {T[]} list - An array of elements of type T. This is the list that will be grouped.
 * @param {K} propertyKey - The property key used to group the elements in the list. The property key must be a key of T.
 *
 * @returns {Map<K, T[]>} - A Map object where the keys are of type K and the values are arrays of elements of type T.
 * Each key in the Map corresponds to a unique property key from the input list.
 * The value associated with each key is an array of all elements in the list that have the same property key.
 *
 * @example
 *
 * Consider the following list of objects:
 *
 * const list = [
 * { name: 'Alice', age: 20 },
 * { name: 'Bob', age: 20 },
 * { name: 'Charlie', age: 30 }
 * ];
 *
 * If we call GroupBy(list, 'age'), the function will return a Map object that looks like this:
 *
 * Map {
 * 20 => [ { name: 'Alice', age: 20 }, { name: 'Bob', age: 20 } ],
 * 30 => [ { name: 'Charlie', age: 30 } ]
 * }
 *
 * This shows that the function has grouped the elements in the list based on their 'age' property.
 *
 */
export function GroupBy<T, K extends keyof T>(list: T[], propertyKey: K): Map<K, T[]> {
  const map = new Map();

  for (const item of list) {

    const key = item[propertyKey];

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(item);

  }

  return map;
}
