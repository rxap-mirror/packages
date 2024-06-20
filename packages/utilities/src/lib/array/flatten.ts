import { WithChildren } from '../helpers';

/**
 * Flattens a nested array of objects with potential children into a flat array of objects.
 *
 * This function recursively traverses each object in the input array. If an object has a 'children'
 * property, it flattens the children and appends them to the accumulator. Objects without children
 * are directly added to the accumulator. The function handles nested structures by recursively
 * calling itself on the children of the current object.
 *
 * @param array - An array of objects where each object can optionally have a 'children' property containing an array of similar objects.
 * @returns A flat array containing all objects from the input array and its nested children arrays.
 *
 * @typeParam T - The type of the objects in the array, which can optionally include a 'children' property of the same type.
 *
 * @example
 * // Define a nested array with type annotations
 * const nestedArray: Array<WithChildren<{ id: number, name: string }>> = [
 * { id: 1, name: 'Parent 1', children: [
 * { id: 2, name: 'Child 1' },
 * { id: 3, name: 'Child 2', children: [
 * { id: 4, name: 'Grandchild 1' }
 * ]}
 * ]},
 * { id: 5, name: 'Parent 2' }
 * ];
 *
 * // Flattening the nested array
 * const flatArray = flatten(nestedArray);
 * // Output: [{ id: 1, name: 'Parent 1' }, { id: 2, name: 'Child 1' }, { id: 3, name: 'Child 2' }, { id: 4, name: 'Grandchild 1' }, { id: 5, name: 'Parent 2' }]
 *
 */
export function flatten<T>(array: Array<WithChildren<T>>): T[] {
  return array.reduce((acc, item) => {
    if (item.children) {
      acc.push(item, ...flatten(item.children ?? []));
    } else {
      acc.push(item);
    }
    return acc;
  }, [] as T[]);
}
