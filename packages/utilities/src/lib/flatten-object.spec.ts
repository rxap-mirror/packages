import { flattenObject } from './flatten-object';

describe('flattenObject', () => {

  it('should flatten nested objects with dot notation', () => {
    expect(flattenObject({ a: { b: 1, c: 2 }, d: 3 })).toEqual({ 'a.b': 1, 'a.c': 2, d: 3 });
  });

  it('should not crash on null values', () => {
    expect(flattenObject({ a: null, b: { c: 1 } })).toEqual({ a: null, 'b.c': 1 });
  });

});
