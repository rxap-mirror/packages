import {
  addToMetadata,
  clearMetadata,
  getMetadata,
  getMetadataKeys,
  getOwnMetadata,
  hasMetadata,
  mergeWithMetadata,
  removeFromMetadata,
  setMetadata,
  setMetadataMap,
  setMetadataMapMap,
  setMetadataMapSet,
} from './meta-data';

describe('meta-data helpers', () => {
  class Target {
    prop = 1;
  }

  it('sets, checks, reads and clears metadata on a class', () => {
    expect(hasMetadata('k', Target)).toBe(false);
    expect(getMetadata('k', Target)).toBeNull();
    setMetadata('k', 'v', Target);
    expect(hasMetadata('k', Target)).toBe(true);
    expect(getMetadata('k', Target)).toBe('v');
    expect(getMetadataKeys(Target)).toContain('k');
    clearMetadata('k', Target);
    expect(hasMetadata('k', Target)).toBe(false);
  });

  it('supports property level metadata', () => {
    setMetadata('k', 1, Target.prototype, 'prop');
    expect(getMetadata('k', Target.prototype, 'prop')).toBe(1);
    expect(getMetadata('k', Target.prototype)).toBeNull();
  });

  it('getOwnMetadata ignores inherited metadata', () => {
    class A {}
    class B extends A {}
    setMetadata('own', 1, A);
    expect(getMetadata('own', B)).toBe(1);
    expect(getOwnMetadata('own', B)).toBeNull();
    expect(getOwnMetadata('own', A)).toBe(1);
  });

  it('addToMetadata appends unique values', () => {
    class A {}
    addToMetadata('list', 'a', A);
    addToMetadata('list', 'b', A);
    addToMetadata('list', 'a', A);
    expect(getMetadata('list', A)).toEqual(['a', 'b']);
  });

  it('mergeWithMetadata deep merges objects', () => {
    class A {}
    mergeWithMetadata('obj', { a: { x: 1 } }, A);
    mergeWithMetadata('obj', { a: { y: 2 }, b: 3 }, A);
    expect(getMetadata('obj', A)).toEqual({ a: { x: 1, y: 2 }, b: 3 });
  });

  it('removeFromMetadata removes matching values', () => {
    class A {}
    addToMetadata('list', 1, A);
    addToMetadata('list', 2, A);
    removeFromMetadata('list', 1, A);
    expect(getMetadata('list', A)).toEqual([2]);
    addToMetadata('objs', { id: 1 }, A);
    addToMetadata('objs', { id: 2 }, A);
    removeFromMetadata('objs', { id: 1 }, A, undefined, (a, b) => a.id === b.id);
    expect(getMetadata('objs', A)).toEqual([{ id: 2 }]);
  });

  it('removeFromMetadata on missing metadata stores an empty list', () => {
    class A {}
    removeFromMetadata('nothing', 1, A);
    expect(getMetadata('nothing', A)).toEqual([]);
    expect(hasMetadata('nothing', A)).toBe(true);
  });

  describe('metadata maps are copy on write for subclasses', () => {
    it('setMetadataMap adds to the own map on repeated calls', () => {
      class A {}
      setMetadataMap('a', 1, 'm', A);
      setMetadataMap('b', 2, 'm', A);
      expect(Array.from(getMetadata<Map<string, number>>('m', A)!.entries())).toEqual([['a', 1], ['b', 2]]);
    });

    it('setMetadataMapSet does not leak into the parent sets', () => {
      class A {}
      class B extends A {}
      setMetadataMapSet('k', 'parent', 'm', A);
      setMetadataMapSet('k', 'child', 'm', B);
      setMetadataMapSet('k', 'child2', 'm', B);
      expect(Array.from(getMetadata<Map<string, Set<string>>>('m', A)!.get('k')!)).toEqual(['parent']);
      expect(Array.from(getMetadata<Map<string, Set<string>>>('m', B)!.get('k')!)).toEqual(['parent', 'child', 'child2']);
    });

    it('setMetadataMapMap does not leak into the parent maps', () => {
      class A {}
      class B extends A {}
      setMetadataMapMap('k', 'a', 1, 'm', A);
      setMetadataMapMap('k', 'b', 2, 'm', B);
      expect(Array.from(getMetadata<Map<string, Map<string, number>>>('m', A)!.get('k')!.keys())).toEqual(['a']);
      expect(Array.from(getMetadata<Map<string, Map<string, number>>>('m', B)!.get('k')!.keys())).toEqual(['a', 'b']);
    });
  });
});
