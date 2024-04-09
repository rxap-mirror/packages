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

export function IterateOverPropertyPaths(object: Record<string, unknown> | unknown[] | object, onlyLeaf = false) {
  return new PropertyPathIterable(object, onlyLeaf);
}
