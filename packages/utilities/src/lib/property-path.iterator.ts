export class PropertyPathIterator implements Iterator<[ string, unknown ]> {

  private index = 0;
  private current!: PropertyPathIterator | null;

  constructor(
    private readonly object: Record<string, unknown> | unknown[] | object,
    private readonly onlyLeaf = false,
    private readonly parent?: string,
  ) {
  }

  next(): IteratorResult<[ string, unknown ]> {
    if (this.current) {
      const result = this.current.next();
      if (!result.done) {
        return result;
      }
      this.current = null;
    }
    const keys = Object.keys(this.object);
    if (keys.length <= this.index) {
      return { done: true, value: undefined };
    }
    const key = keys[this.index++];
    const value = (this.object as any)[key];
    const path = (this.parent ? [this.parent, key].join('.') : key) + '';
    if (typeof value === 'object' && !!value) {
      this.current = new PropertyPathIterator(value, this.onlyLeaf, path);
      if (this.onlyLeaf) {
        return this.next();
      }
    }
    return { value: [ path, value ] as [string, unknown], done: false };
  }


}

export class PropertyPathIterable implements Iterable<[ string, unknown ]> {

  constructor(private readonly object: Record<string, unknown> | unknown[] | object, private readonly onlyLeaf = false) {
  }

  [Symbol.iterator](): Iterator<[ string, unknown ]> {
    return new PropertyPathIterator(this.object, this.onlyLeaf);
  }

}

/**
 * Creates an iterable that allows iteration over the property paths of a given object or array.
 *
 * This function returns an instance of `PropertyPathIterable` which can be used to iterate through
 * the property paths of the provided object. A property path represents the sequence of properties
 * that one would access to reach a particular nested property value within the object.
 *
 * @param {Record<string, unknown> | unknown[] | object} object - The object or array whose property paths are to be iterated.
 * @param {boolean} [onlyLeaf=false] - If set to true, the iterable will only provide paths that lead to leaf nodes (i.e., nodes that do not have nested objects or arrays as values).
 * @returns {PropertyPathIterable} An iterable that provides the property paths of the input object or array.
 *
 * @example
 * // For an object { a: { b: { c: 1 } }, d: 2 }
 * const iterable = IterateOverPropertyPaths(object, true);
 * for (const path of iterable) {
 * console.log(path); // Outputs "a.b.c" and "d"
 * }
 */
export function IterateOverPropertyPaths(object: Record<string, unknown> | unknown[] | object, onlyLeaf = false) {
  return new PropertyPathIterable(object, onlyLeaf);
}
