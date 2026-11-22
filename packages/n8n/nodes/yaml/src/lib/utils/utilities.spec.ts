import {
  capitalize,
  chunk,
  compareItems,
  flatten,
  flattenKeys,
  flattenObject,
  formatPrivateKey,
  fuzzyCompare,
  generatePairedItemData,
  getResolvables,
  keysToLowercase,
  preparePairedItemDataArray,
  processJsonInput,
  sanitizeDataPathKey,
  shuffleArray,
  updateDisplayOptions,
  wrapData,
} from './utilities';

describe('utilities', () => {
  it('chunk', () => {
    expect(chunk(['a', 'b', 'c', 'd'], 2)).toEqual([['a', 'b'], ['c', 'd']]);
    expect(chunk(['a', 'b', 'c', 'd'], 3)).toEqual([['a', 'b', 'c'], ['d']]);
    expect(chunk([])).toEqual([]);
    expect(chunk([1, 2], 0)).toEqual([]);
    expect(chunk([1, 2])).toEqual([[1], [2]]);
  });

  it('shuffleArray keeps all elements', () => {
    const a = [1, 2, 3, 4, 5, 6];
    shuffleArray(a);
    expect([...a].sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('flattenKeys', () => {
    expect(flattenKeys({ a: { b: 1, c: { d: 2 } }, e: 3 } as any)).toEqual({ 'a.b': 1, 'a.c.d': 2, e: 3 });
    expect(flattenKeys(5 as any, ['x'])).toEqual({ x: 5 });
  });

  it('flatten', () => {
    expect(flatten([['a', 'b'], ['c', ['d']] as any])).toEqual(['a', 'b', 'c', 'd']);
  });

  it('compareItems', () => {
    const a: any = { json: { x: { y: 1 }, z: 1 } };
    const b: any = { json: { x: { y: 1 }, z: 2 } };
    expect(compareItems(a, b, ['x.y'])).toBe(true);
    expect(compareItems(a, b, ['x'])).toBe(true);
    expect(compareItems(a, b, ['z'])).toBe(false);
    expect(compareItems(a, { json: { x: { y: 2 } } }, ['x.y'])).toBe(false);
    // without dot notation the key 'x.y' is looked up literally
    expect(compareItems(a, { json: { x: { y: 2 } } }, ['x.y'], true)).toBe(true);
    expect(compareItems(a, b, ['x'], true)).toBe(true);
    expect(compareItems(a, b, ['z'], true)).toBe(false);
  });

  it('updateDisplayOptions merges into every property', () => {
    const res = updateDisplayOptions({ show: { operation: ['a'] } }, [
      { displayName: 'A', name: 'a', type: 'string', default: '' },
      { displayName: 'B', name: 'b', type: 'string', default: '', displayOptions: { show: { mode: ['x'] } } },
    ]);
    expect(res[0].displayOptions).toEqual({ show: { operation: ['a'] } });
    expect(res[1].displayOptions).toEqual({ show: { mode: ['x'], operation: ['a'] } });
  });

  it('processJsonInput', () => {
    expect(processJsonInput('{"a":1}')).toEqual({ a: 1 });
    expect(processJsonInput({ a: 1 })).toEqual({ a: 1 });
    expect(() => processJsonInput('{', 'field')).toThrow(/Input 'field'\s+must contain a valid JSON/);
    expect(() => processJsonInput(5)).toThrow('must contain a valid JSON');
  });

  describe('fuzzyCompare', () => {
    it('strict when disabled', () => {
      expect(fuzzyCompare(false)(1, '1')).toBe(false);
      expect(fuzzyCompare(false)({ a: 1 }, { a: 1 })).toBe(true);
    });

    it('loose comparisons when enabled', () => {
      const c = fuzzyCompare(true);
      expect(c(1, '1')).toBe(true);
      expect(c('1', 1)).toBe(true);
      expect(c('', null)).toBe(true);
      expect(c([], undefined)).toBe(true);
      expect(c(undefined, '')).toBe(true);
      expect(c({ a: 1 }, '{"a":1}')).toBe(true);
      expect(c('{"a":1}', { a: 1 })).toBe(true);
      expect(c({ a: 1 }, 'not json')).toBe(false);
      expect(c(true, 'TRUE')).toBe(true);
      expect(c('false', false)).toBe(true);
      expect(c(true, 1)).toBe(true);
      expect(c(0, false)).toBe(true);
      expect(c(true, '1')).toBe(true);
      expect(c('0', false)).toBe(true);
      expect(c(1, 2)).toBe(false);
      expect(c(true, 'nope')).toBe(false);
      expect(c(null, 0)).toBe(false);
    });

    it('treats null and 0 as equal from compare version 2', () => {
      const c = fuzzyCompare(true, 2);
      expect(c(null, 0)).toBe(true);
      expect(c('0', null)).toBe(true);
      expect(c(null, 'x')).toBe(false);
    });
  });

  it('wrapData', () => {
    expect(wrapData({ a: 1 })).toEqual([{ json: { a: 1 } }]);
    expect(wrapData([{ a: 1 }, { b: 2 }])).toEqual([{ json: { a: 1 } }, { json: { b: 2 } }]);
  });

  it('keysToLowercase', () => {
    expect(keysToLowercase({ A: 1, Bc: 'x' })).toEqual({ a: 1, bc: 'x' });
    expect(keysToLowercase(null)).toBeNull();
    expect(keysToLowercase([1])).toEqual([1]);
    expect(keysToLowercase('s')).toBe('s');
  });

  it('formatPrivateKey', () => {
    expect(formatPrivateKey('')).toBe('');
    expect(formatPrivateKey('a\nb')).toBe('a\nb');
    expect(formatPrivateKey('-----BEGIN PRIVATE KEY----- abc def -----END PRIVATE KEY-----')).toBe(
      '-----BEGIN PRIVATE KEY-----\nabc\ndef\n-----END PRIVATE KEY-----',
    );
    expect(formatPrivateKey('-----BEGIN PUBLIC KEY----- abc -----END PUBLIC KEY-----', true)).toBe(
      '-----BEGIN PUBLIC KEY-----\nabc\n-----END PUBLIC KEY-----',
    );
    expect(
      formatPrivateKey('-----BEGIN RSA PRIVATE KEY----- Proc-Type: 4,ENCRYPTED DEK-Info: AES abc -----END RSA PRIVATE KEY-----'),
    ).toContain('Proc-Type:4,ENCRYPTED');
  });

  it('getResolvables', () => {
    expect(getResolvables('')).toEqual([]);
    expect(getResolvables('a {{ $json.a }} b {{ x }}')).toEqual(['{{ $json.a }}', '{{ x }}']);
    expect(getResolvables('none')).toEqual([]);
  });

  it('flattenObject', () => {
    const date = new Date('2020-01-01T00:00:00Z');
    expect(flattenObject({ a: { b: 1, c: { d: 2 } }, e: null, f: date, g: { h: undefined } } as any)).toEqual({
      'a.b': 1,
      'a.c.d': 2,
      e: null,
      f: date.toString(),
    });
  });

  it('capitalize', () => {
    expect(capitalize('abc')).toBe('Abc');
    expect(capitalize('')).toBe('');
  });

  it('paired item helpers', () => {
    expect(generatePairedItemData(2)).toEqual([{ item: 0 }, { item: 1 }]);
    expect(preparePairedItemDataArray(undefined)).toEqual([]);
    expect(preparePairedItemDataArray(3)).toEqual([{ item: 3 }]);
    expect(preparePairedItemDataArray([{ item: 1 }])).toEqual([{ item: 1 }]);
    expect(preparePairedItemDataArray({ item: 2 })).toEqual([{ item: 2 }]);
  });

  it('sanitizeDataPathKey', () => {
    expect(sanitizeDataPathKey({ a: 1 }, 'a')).toBe('a');
    expect(sanitizeDataPathKey({ a: 1 }, "['a']")).toBe('a');
    expect(sanitizeDataPathKey({ a: 1 }, '["a"]')).toBe('a');
    expect(sanitizeDataPathKey({ a: 1 }, "['b']")).toBe('b');
    expect(sanitizeDataPathKey({ a: 1 }, 'z')).toBe('z');
  });
});
